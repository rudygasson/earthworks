export function allConditions(conditions = {}) {
    return (feature) => Object.keys(conditions)
        .every(key => conditions[key](feature.properties[key]));
}
