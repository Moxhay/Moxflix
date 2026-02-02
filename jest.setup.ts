import '@testing-library/jest-dom';

// Mock Web API globals for Jest testing environment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof global.Request === 'undefined') {
    global.Request = class Request {} as any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof global.Response === 'undefined') {
    global.Response = class Response {
        _body: any;
        _init: any;
        constructor(body?: any, init?: any) {
            this._body = body;
            this._init = init;
        }
        async json() {
            return typeof this._body === 'string' ? JSON.parse(this._body) : this._body || {};
        }
        get status() {
            return this._init?.status || 200;
        }
        static json(data: any, init?: any) {
            return new this(JSON.stringify(data), init);
        }
    } as any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof global.Headers === 'undefined') {
    global.Headers = class Headers {} as any;
}
