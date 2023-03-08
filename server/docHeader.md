# Introduction

This document contains all of the routes in the Keppel CMMS HTTP REST API

Excluding the [Log In](#api-User-Login) route, all calls to the API should have cookie authentication. The cookie can be retrieved with the aforementioned [Log In](#api-User-Login) route, along with a username and its corresponding password.

Example
```json
    Cookie: connect.sid=...
```

Otherwise, a 401 response would be generated
```json
    401 Unauthorized
    {"you are not logged in"}
```

In the event where the API is unable to fulfil your request, a generic 500 response would be generated, along with an `errormsg`, which may be any primitive or object (etc. `number`/`string`/`Object`) or an array of any primitive or object
```json
    500 Internal Server Error
    {"errormsg": 0} OR
    {"errormsg": "..."} OR
    {"errormsg": {...}} OR
    {"errormsg": {...}, {...}, {...}} OR
    {"errormsg": ...}
```
