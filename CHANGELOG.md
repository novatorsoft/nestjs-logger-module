# Changelog

## [1.5.1](https://github.com/novatorsoft/nestjs-logger-module/compare/v1.5.0...v1.5.1) (2026-02-26)

### Bug Fixes

* refactor log cleanup functionality in LoggerService and related services ([c18df04](https://github.com/novatorsoft/nestjs-logger-module/commit/c18df043c1cf83b93fdbf1950ca4fac9076665ad))

## [1.5.0](https://github.com/novatorsoft/nestjs-logger-module/compare/v1.4.0...v1.5.0) (2026-02-26)

### Features

* integrate @nestjs/schedule for log cleanup and enhance retention management ([bea0690](https://github.com/novatorsoft/nestjs-logger-module/commit/bea06907b4d368fb76f65c32a0952f2d8c6d0000))

## [1.4.0](https://github.com/novatorsoft/nestjs-logger-module/compare/v1.3.0...v1.4.0) (2026-01-02)

### Features

* add serviceName support to logging configuration and update related tests ([74acc3d](https://github.com/novatorsoft/nestjs-logger-module/commit/74acc3de93f75bc95d2eabddf32febe8fe5ef758))

## [1.3.0](https://github.com/novatorsoft/nestjs-logger-module/compare/v1.1.0...v1.2.0) (2026-01-02)

### Features

* add requestType field to logging interceptors for better request identification ([d8c4b44](https://github.com/novatorsoft/nestjs-logger-module/commit/d8c4b443ab3f439092c88a6dd297951129486095))
* create rpc logging interceptor ([879271b](https://github.com/novatorsoft/nestjs-logger-module/commit/879271bd68fc4a4e426a9fcef82f677047ab3481))
* enhance HttpLoggingInterceptor to skip logging for non-http contexts and add corresponding unit test ([28a858a](https://github.com/novatorsoft/nestjs-logger-module/commit/28a858a0b7ddace226e8885f1e1b8a170ffa471e))
## [1.2.0](https://github.com/novatorsoft/nestjs-logger-module/compare/v1.1.0...v1.2.0) (2026-01-02)

### Features

* create http logging interceptor ([8a2be92](https://github.com/novatorsoft/nestjs-logger-module/commit/8a2be92a0d1e6ec3dd74b95f93ac8a691b703e5c))
* create mongodb provider ([3906d09](https://github.com/novatorsoft/nestjs-logger-module/commit/3906d09f753618cc706528ed826d489e12f5616d))
* implement LoggerConfigModule with dynamic registration and add unit tests ([dcb2509](https://github.com/novatorsoft/nestjs-logger-module/commit/dcb2509d1eb8519f84fb6efc874a0d87c0d9a0c6))

## [1.1.0](https://github.com/novatorsoft/nestjs-logger-module/compare/v1.0.0...v1.1.0) (2025-12-29)

### Features

* create file provider ([5feb913](https://github.com/novatorsoft/nestjs-logger-module/commit/5feb9136666ca7604001b3106a88aa7cf3e647be))
* implement logger configuration with dynamic enabling and remove MockService ([6ab6a42](https://github.com/novatorsoft/nestjs-logger-module/commit/6ab6a4226a4e6de239548b5b4818d2d64793a50a))

### Bug Fixes

* rename logger property to provider in ConsoleConfig for clarity ([251f51d](https://github.com/novatorsoft/nestjs-logger-module/commit/251f51d33217b07ae531468508af03926e78da08))

## 1.0.0 (2025-12-28)

### Features

* create logger module and console provider ([d0b602c](https://github.com/novatorsoft/nestjs-logger-module/commit/d0b602cde15f740c2f41a4a90a99893385bb72ec))
* create mock provider ([60a88c6](https://github.com/novatorsoft/nestjs-logger-module/commit/60a88c62f749f17b15b428ba30c131fced02b07b))
* setup lib ([8cdbf28](https://github.com/novatorsoft/nestjs-logger-module/commit/8cdbf28044900f979664088635d737688ae70dc7))
