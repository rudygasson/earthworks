import sqlite3
from flask import abort

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
    "count": "count(*)",
    "length": "sum(earthwork_length_m)",
    "min": min_fields
}


# valid_columns could also return a simple pre-defined list
# to protect the db from unauthorized access to
# existing but hidden columns

def valid_columns(table_name: str, key: str, cursor) -> list:
    columns_avail = cursor.execute(
        f"pragma table_info({table_name})").fetchall()
    valid = {
            "area": "area_dbfo",
            "road": "road",
            "next_pid": "next_principal_inspection_date"
            }
    avail = [col[1] for col in columns_avail]
    if key in valid and valid[key] in avail:
        return valid[key]
    else:
        cursor.close()
        abort(400)


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
    with sqlite3.connect('data/earthworks.db') as dbcon:
        dbcon.row_factory = sqlite3.Row
        c = dbcon.cursor()
        part = sql_options[kwargs.get('opt', None)]

        sql = f"SELECT {part} FROM earthworks_view "
        sql_filter = ""

        # Collect filters and protect against SQL injection
        print(*args)
        if len(args) > 0:
            for n, key in enumerate(args):

                column = valid_columns('earthworks_view', key, c)
                entry = args[key]

                if ";" in str(entry):
                    c.close()
                    abort(400)

                if n > 0:
                    sql_filter += " AND "

                sql_filter += column + "='" + str(entry) + "'"
            sql += f"WHERE {sql_filter} "

        add_date_filter(sql=sql, **kwargs)

        print(sql)
        c.execute(sql + ";")
        output = c.fetchall()
        c.close()
    return output
