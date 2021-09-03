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

def valid_columns(table_name: str, cursor) -> list:
    columns_info = cursor.execute(
        f"pragma table_info({table_name})").fetchall()
    return [col[1] for col in columns_info]


# create sql commands to convert date strings

def get_date(column: str):
    sql_str = ""
    # extract date from string 'MM/DD/YYYY' and create
    # sql command to convert to 'YYYY-MM-DD'
    for n, (x, y) in enumerate([(7, 4), (1, 2), (4, 2)]):
        if n > 0:
            sql_str += "|| '-' || "
        sql_str += f"substr({column}, {x}, {y}) "
    return sql_str


def after(date: str):
    return "> '" + date + "'"


def before(date: str):
    return "< '" + date + "'"


def query(args, **kwargs):
    with sqlite3.connect('data/earthworks.db') as dbcon:
        dbcon.row_factory = sqlite3.Row
        c = dbcon.cursor()
        part = sql_options[kwargs.get('opt', None)]

        sql = f"SELECT {part} FROM earthworks_view "
        sql_filter = ""

        # Collect filters and protect against SQL injection

        if len(args) > 0:
            for n, column in enumerate(args):
                print(column)
                if column not in valid_columns('earthworks_view', c):
                    c.close()
                    abort(404)

                entry = args[column]

                if ";" in str(entry):
                    c.close()
                    abort(404)

                if n > 0:
                    sql_filter += " AND "

                sql_filter += column + "='" + str(entry) + "'"
            sql += f"WHERE {sql_filter} "

        date_filter = kwargs.get('date', None)
        if date_filter:
            if sql_filter == "":
                sql += "WHERE "
            else:
                sql += "AND "
            sql += get_date(
                "next_principal_inspection_date") + before(date_filter)

        print(sql)
        c.execute(sql + ";")
        output = c.fetchall()
        c.close()
    return output
