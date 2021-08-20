# Earthworks REST API

Version 0.0.1 (wip)

## Structure

| URL pattern                 | Response format       | Description                                                  |
| :-------------------------- | --------------------- | :----------------------------------------------------------- |
| `./earthworks/{id:int}`     | GeoJSON Point or Line | All details for a specific earthwork. GeoJSON feature (point or line?) with all details for earthwork `id`. |
| `./areas/{id:int}`          | JSON                  | List of aggregated data for `area` [^1].                     |
| `./earthworks?{parameters}` | GeoJSON feature list  | Filter for a GeoJSON feature list with limited data for each point. Number must be limited via the given parameter set and default values. |

### Examples

[^1]: `https://{hw_eng}.co.uk/area/10`
```JavaScript
{
    "area": 10,
    "earthworks": {
        "length_m": 234365.34,
        "inspections": {
            "due_this_fy": {
                "sum": 2230,
                "length_m": 52435.23
            },
            "overdue": {
                "sum": 230,
                "length_m": 10435.23
            }
        }
    }
}
```



This can only be a wishlist. The issue with this project is that we have little influence on the structure of the endpoints. It is technically possible to generate the aggregated data in the front-end, based on a the set of point data, but that would be very inefficient.

### Where should the logic live?

The main issue for me is the question of where the aggregation logic should live. Since we do not have any access to the backend, every little change of aggregation has to be provided by and negotiated with the implementers of the API. So it seems to be better to have as many aggregation endpoints as possible in the first wish list to present and in the meantime to prepare for aggregation logic in the front-end if our wishes are rejected.

### Performance

The biggest performance issue so far however is the rendering of the marker objects in the map, not the calculations or the aggregation. Possible optimisations are:

- Reduce detail based on zoom level. The points/lines could be aggregated and shown as a polygon, for example
- Reduce data within the data points with "lazy loading". The details for each earthwork could be loaded on demand (popup activated) via the specific endpoint and the id.
