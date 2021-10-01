area_list_a = [{
            'area': 1,
            'count': 10,
            'length': 20
        },
        {
            'area': 2,
            'count': 20,
            'length': 30
        }]

area_list_b = [{
            'area': 1,
            'count': 5,
            'length': 15
        },
        {
            'area': 3,
            'count': 25,
            'length': 35
        },
        {
            'area': 4,
            'count': 45,
            'length': 25
        }]

combined_area_list_a_b = [
    {
        'id': 1,
        'due': {
            'count': 10,
            'length': 20},
        'overdue': {
            'count': 5,
            'length': 15}
    },
    {
        'id': 2,
        'due': {
            'count': 20,
            'length': 30
        },
        'overdue': {}
    },
    {
        'id': 3,
        'due': {},
        'overdue': {
            'count': 25,
            'length': 35}
    },
    {
        'id': 4,
        'due': {},
        'overdue': {
            'count': 45,
            'length': 25}
    }
]

combined_area_list_b_a = [
    {
        'id': 1,
        'due': {
            'count': 5,
            'length': 15},
        'overdue': {
            'count': 10,
            'length': 20}
    },
    {
        'id': 2,
        'due': {},
        'overdue': {
            'count': 20,
            'length': 30}
    },
    {
        'id': 3,
        'due': {
            'count': 25,
            'length': 35},
        'overdue': {}
    },
    {
        'id': 4,
        'due': {
            'count': 45,
            'length': 25},
        'overdue': {}
    }
]
