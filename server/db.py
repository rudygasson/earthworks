import sqlite3

flags = {
    "all": "*",
    "count": "count(*)",
    "length": "sum(earthwork_length_m)"
}


# valid_columns could also return a simple pre-defined list
# to protect the db from unauthorized access to
# existing but hidden columns

def valid_columns(table_name: str, cursor) -> list:
    columns_info = cursor.execute(
        f"pragma table_info({table_name})").fetchall()
    return [col[1] for col in columns_info]


def query(args, flag):
    with sqlite3.connect('../data/earthworks.db') as dbcon:
        dbcon.row_factory = sqlite3.Row
        c = dbcon.cursor()
        sql_filter = ""
        part = flags[flag]
        if len(args) > 0:
            # Protect against SQL injection
            for n, column in enumerate(args):
                if column not in valid_columns('earthworks_view', c):
                    return False
                entry = args[column]

                if ";" in str(entry):
                    return False
                if n > 0:
                    sql_filter += " AND "
                sql_filter += column + "='" + str(entry) + "'"
            sql = f"select {part} from earthworks_view where {sql_filter};"
        else:
            # Return all data: This can be huge! (ca. 50000 records)
            sql = f"select {part} from earthworks_view;"
        print(sql)
        c.execute(sql)
        output = c.fetchall()
        c.close()
    return output
