def remove_key(d: dict, name: str) -> dict:
    return dict(filter(lambda k: k[0] != name, d.items()))


def merge(a: dict, b: dict) -> dict:
    id = a.get("area") or b.get("area")
    return {"id": id,
            "due": remove_key(a, "area"),
            "overdue": remove_key(b, "area")}


def merge_area_lists(a: list, b: list) -> list:
    index_a = 0
    index_b = 0
    merged = []

    while index_a < len(a) or index_b < len(b):
        if index_a == len(a):
            merged.append(merge({}, b[index_b]))
            index_b += 1
            continue
        if index_b == len(b):
            merged.append(merge(a[index_a], {}))
            index_a += 1
            continue
        da = a[index_a]
        db = b[index_b]
        if da["area"] == db["area"]:
            merged.append(merge(da, db))
            index_a += 1
            index_b += 1
            continue
        if da["area"] < db["area"]:
            merged.append(merge(da, {}))
            index_a += 1
            continue
        merged.append(merge({}, db))
        index_b += 1

    return merged
