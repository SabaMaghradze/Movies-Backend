class ApiUtils {

    constructor(queryObj, reqQuery) {
        this.queryObj = queryObj;
        this.reqQuery = reqQuery;
    }

    filter() {
        const query = {};

        const comparisonOperators = {
            gte: '$gte',
            gt: '$gt',
            lte: '$lte',
            lt: '$lt',
            eq: '$eq',
            ne: '$ne'
        };

        for (const key in this.reqQuery) {
            const fieldValue = this.reqQuery[key];
            if (typeof fieldValue === 'object') {
                query[key] = {};
                for (const op in fieldValue) {
                    if (comparisonOperators[op]) {
                        query[key][comparisonOperators[op]] = fieldValue[op];
                    }
                }
            }
        }
        this.queryObj = this.queryObj.find(query);
        return this;
    }
    sort() {
        const sort = {};
        for (const key in this.reqQuery) {
            if (key === 'sort') {
                const sortParams = this.reqQuery.sort.split(',');
                sortParams.forEach(param => {
                    const [field, order] = param.split(':');
                    sort[field] = order === 'asc' ? 1 : -1;
                });
            }
        }
        this.queryObj = this.queryObj.sort(sort);
        return this;
    }

    limitFields() {
        let fields;
        if (this.reqQuery.fields) {
            fields = this.reqQuery.fields.replace(/,/g, ' ');
        }
        this.queryObj = this.queryObj.select(fields);
        return this;
    }

    paginate() {
        const page = this.reqQuery.page || 1;
        let limit = this.reqQuery.limit || 0;
        if (limit === 0) {
            limit = Number.MAX_SAFE_INTEGER;
        }
        // page 1: 1-3; page 2: 4-6; page 3: 6-8
        const skip = (page - 1) * limit;

        this.queryObj = this.queryObj.limit(limit).skip(skip);

        return this;
    }
}

module.exports = ApiUtils;