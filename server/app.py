from db import query
from flask import Flask, request, jsonify, render_template, abort, redirect
from flask_compress import Compress
from flask_cors import CORS
from geojson import Feature, LineString, FeatureCollection

app = Flask(__name__)
CORS(app)
Compress(app)


@app.route('/')
def index():
    return redirect('/earthworks?road=M6')


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


@app.route('/earthworks/<int:number>')
def single(number):
    output = query({"id": number}, opt="all")

    if not isinstance(output, list) or len(output) == 0:
        abort(404)

    row = output[0]
    props = {col: row[col] for col in row.keys()}

    feature = Feature(
        geometry=LineString([
            (props['start_easting'], props['start_northing']),
            (props['end_easting'], props['end_northing'])
        ]), properties=props
    )

    return jsonify(feature)


@app.route('/earthworks')
def search():
    output = query(request.args, opt="min")

    if not isinstance(output, list):
        abort(404)

    # Create list of property dictionaries
    properties = [
        {col: rows[col] for col in rows.keys()} for rows in output
    ]

    def remove_coords(entry):
        return "start" not in entry[0] and "end" not in entry[0]

    # Create GEOJSON feature list according to standard
    features = FeatureCollection([
        Feature(
            geometry=LineString(
                [
                    (props['start_easting'], props['start_northing']),
                    (props['end_easting'], props['end_northing'])
                ]
            ),
            properties=dict(
                filter(remove_coords, props.items())
            )
        ) for props in properties
    ])

    # Serialize to JSON and create http response header
    return jsonify(features)


@app.route('/earthworks/count')
def count():
    rows = query(request.args, opt="count")
    return jsonify({"count": rows[0][0]})


@app.route('/earthworks/length')
def length():
    rows = query(request.args, opt="length")
    return jsonify({"length": round(rows[0][0] / 1000, 2)})


@app.route('/earthworks/areas')
def area_list():
    if request.args.get('q') == "table":
        # return combined table data
        due = query({"next_pi": "due"}, opt="area set")
        overdue = query({"next_pi": "overdue"}, opt="area set")

        due_list = [{col: rows[col] for col in rows.keys()} for rows in due]
        overdue_list = [{col: rows[col] for col in rows.keys()} for rows in overdue]
        areas = merge_area_lists(due_list, overdue_list)
        return jsonify(areas)
    else:
        output = query(request.args, opt="area set")
        areas = [{col: rows[col] for col in rows.keys()} for rows in output]
    return jsonify(areas)


def merge_area_lists(a: list, b: list) -> list:
    index_b = 0
    merged = []
    for obj in a:
        if obj["area"] == b[index_b]["area"]:
            del b[index_b]["area"]
            merged.append(
                {"id": obj.pop('area'),
                 "due": obj,
                 "overdue": b[index_b]})
            index_b += 1
        else:
            if obj["area"] < b[index_b]["area"]:
                merged.append(
                    {"id": obj.pop('area'),
                     "due": obj,
                     "overdue": {}})
            else:
                merged.append(
                    {"id": b[index_b].pop("area"),
                     "due": {},
                     "overdue": b[index_b]})
                index_b += 1
    return merged


if __name__ == "__main__":
    app.run(debug=True)
