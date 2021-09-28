import sqlite3
from flask import abort

db_path = "data/earthworks.db"
db_table_name = "earthworks_view"

min_fields = """
    earthwork_number,
    start_easting,
    start_northing,
    end_easting,
    end_northing,
    area_dbfo,
    next_principal_inspection_date
"""

sql_options = {
    "all": "*",
    "area set": '''area_dbfo AS area,
                count(area_dbfo) AS count,
                round(sum(earthwork_length_m)/1000, 3) AS "length_km"''',
    "count": "count(*)",
    "length": "sum(earthwork_length_m)",
    "min": min_fields
}

sql_groupby = {
    "area set": "area"
}

valid_params = {
    "area": "area_dbfo",
    "road": "road",
    "id": "earthwork_number",
    "next_pi": "next_principal_inspection_date"
}

due_rules = {
    "due": {"before": "2022-04-01", "after": "2021-03-31"},
    "overdue": {"before": "2021-04-01"},
    "alldue": {"before": "2022-04-01"},
    "good": {"after": "2022-03-31"}
}


# create sql commands to convert date strings
def get_date(column: str):
    sql_str = ""
    # extract date from string 'MM/DD/YYYY' and create
    # sql command to convert to 'YYYY-MM-DD'
    for n, (x, y) in enumerate([(7, 4), (1, 2), (4, 2)]):
        if n > 0:
            sql_str += " || '-' || "
        sql_str += f"substr({column}, {x}, {y})"
    return sql_str


def filter_verb(sql_filter):
    if len(sql_filter) == 0:
        return " WHERE "
    else:
        return " AND "


def add_date_filter(sql="", **kwargs):
    if kwargs.get('before', None):
        sql += (
            filter_verb(sql)
            + get_date(kwargs['col'])
            + " < '" + kwargs['before'] + "'"
        )
    if kwargs.get('after', None):
        sql += (
            filter_verb(sql)
            + get_date(kwargs['col'])
            + " > '" + kwargs['after'] + "'"
        )
    return sql


def query(args, **kwargs):
    with sqlite3.connect(db_path) as dbcon:
        dbcon.row_factory = sqlite3.Row
        c = dbcon.cursor()
        part = sql_options.get(kwargs.get('opt', None))
        groupby = sql_groupby.get(kwargs.get('opt', None))

        sql = f"SELECT {part} FROM {db_table_name}"
        sql_filter = ""

        # Collect filters and protect against SQL injection
        if len(args) > 0:
            for key in args:
                if key not in valid_params:
                    abort(400)
                if key == "next_pi":
                    period = add_date_filter(
                        col=valid_params[key],
                        **due_rules[args[key]])
                    sql_filter += period
                    continue
                column = valid_params[key]
                entry = args[key]

                if ";" in str(entry) or "'" in str(entry):
                    c.close()
                    abort(400)

                sql_filter += filter_verb(sql_filter)
                sql_filter += column + "='" + str(entry) + "'"
            sql += sql_filter
        sql += " GROUP BY " + groupby if groupby else ""
        print(sql)
        c.execute(sql + " LIMIT 1000;")
        output = c.fetchall()
        c.close()
    return output
