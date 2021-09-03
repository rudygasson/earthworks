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
    output = query({"earthwork_number": number}, "all")

    if type(output) is not list:
        abort(404)

    row = output[0]
    props = {col: row[col] for col in row.keys()}

    feature = Feature(
            geometry=LineString([
                (props['start_easting'], props['start_northing']),
                (props['end_easting'], props['end_northing'])
                ]),
            properties=props)

    return jsonify(feature)


@app.route('/earthworks')
def search():
    output = query(request.args, "all")

    if type(output) is not list:
        abort(404)

    # Create list of property dictionaries
    properties = [
        {col: rows[col] for col in rows.keys()} for rows in output
    ]

    # Create GEOJSON feature list according to standard
    features = FeatureCollection([
        Feature(
            geometry=LineString([
                (props['start_easting'], props['start_northing']),
                (props['end_easting'], props['end_northing'])
                ]),
            properties=props) for props in properties
        ])

    # Serialize to JSON and create http response header
    return jsonify(features)


@app.route('/earthworks/count')
def count():
    rows = query(request.args, "count")
    return jsonify({"count": rows[0][0]})


@app.route('/earthworks/length')
def length():
    rows = query(request.args, "length")
    return jsonify({"length": rows[0][0]})


if __name__ == "__main__":
    app.run(debug=True)
