import db


def test_get_date():
    sql_str = db.get_date("field")
    sql_expect = "substr(field, 7, 4) || '-' || "
    sql_expect += "substr(field, 1, 2) || '-' || "
    sql_expect += "substr(field, 4, 2)"
    assert sql_str == sql_expect


def mock_get_date(field):
    return "test"


def test_add_filter_first(monkeypatch):
    monkeypatch.setattr(db, "get_date", mock_get_date)

    sql_str = db.add_date_filter(col='test', before="2021-09-10")
    assert sql_str == " WHERE test < '2021-09-10'"


def test_add_filter_second(monkeypatch):
    monkeypatch.setattr(db, "get_date", mock_get_date)

    sql_str = db.add_date_filter(
        sql="WHERE test1",
        col='test',
        before="2021-09-13")
    assert sql_str == "WHERE test1 AND test < '2021-09-13'"


def test_add_filter_combined(monkeypatch):
    monkeypatch.setattr(db, "get_date", mock_get_date)

    sql_str = db.add_date_filter(
        col='test',
        before="2021-09-13",
        after="2020-01-03")
    assert sql_str == " WHERE test < '2021-09-13' AND test > '2020-01-03'"


def test_add_filter_after(monkeypatch):
    monkeypatch.setattr(db, "get_date", mock_get_date)

    sql_str = db.add_date_filter(
        col='test',
        after="2020-09-13")
    assert sql_str == " WHERE test > '2020-09-13'"
