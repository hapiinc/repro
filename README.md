Repro
=====

This module is meant to be a reverse proxy route table responsible for routing to targets based on protocol request headers.

## Installation

    npm install repro --save

## Usage

    var proxyTable =
        repro()
            .addRoute('api.' + 'example.com', '127.0.0.1' + ':8080')
            .addRoute('ide.' + 'example.com', '127.0.0.1' + ':8081')
            .addRoute('nav.' + 'example.com', '127.0.0.1' + ':8082'),
        target = proxyTable.getTarget('api.example.com'),
        invalidTarget = proxyTable.getTarget('whoops.example.com');
    console.log(target); // Should yield "http://127.0.0.1:8080"
    console.log(invalidTarget); // Should yield {undefined}

## Tests

No unit tests are currently present. Eventually:

    npm test

## Contributing

In lieu of a formal style guideline, take care to maintain the existing coding style.

## Release History

+ 0.0.1 Initial release
