# archiver-json v0.1.1 [![Build Status](https://travis-ci.org/archiverjs/archiver-json.svg?branch=master)](https://travis-ci.org/archiverjs/archiver-json)

> json [archiver](https://github.com/archiverjs/node-archiver) plugin

## Install

```bash
$ npm install --save archiver-json
```

## Usage

```js
var Archiver = require('archiver');
var ArchiverJson = require('archiver-json');

new Archiver()
  .src('files/*.html')
  .dest('dest/archive.json')
  .use(ArchiverJson())
  .run();
```

## API

### ArchiverJson(options)

#### TBA

## Things of Interest
- [Changelog](https://github.com/archiverjs/archiver-json/releases)
- [Contributing](https://github.com/archiverjs/archiver-json/blob/master/CONTRIBUTING.md)
- [MIT License](https://github.com/archiverjs/archiver-tar/blob/master/LICENSE)