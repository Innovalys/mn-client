# archiver-tar v0.1.0 [![Build Status](https://travis-ci.org/archiverjs/archiver-tar.svg?branch=master)](https://travis-ci.org/archiverjs/archiver-tar)

> tar [archiver](https://github.com/archiverjs/node-archiver) plugin

## Install

```bash
$ npm install --save archiver-tar
```

## Usage

```js
var Archiver = require('archiver');
var ArchiverTar = require('archiver-tar');

new Archiver()
  .src('files/*.html')
  .dest('dest/archive.zip')
  .use(ArchiverTar())
  .run();
```

## API

### ArchiverTar(options)

#### TBA

## Things of Interest
- [Changelog](https://github.com/archiverjs/archiver-tar/releases)
- [Contributing](https://github.com/archiverjs/archiver-tar/blob/master/CONTRIBUTING.md)
- [MIT License](https://github.com/archiverjs/archiver-tar/blob/master/LICENSE)