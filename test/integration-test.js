let expect = require('chai').expect;

let bunyan = require('bunyan');
let logger = bunyan.createLogger({ name: 'mocha-test', level: bunyan.ERROR });
let integration = require('../integration');
const options = {};
describe('Polarity Arin Integration', () => {
  before(() => {
    integration.startup(logger);
  });

  describe('_processRequest', () => {
    it('should return HTTP error', (done) => {
      integration._processRequest('error', null, null, null, options, (err, result) => {
        //console.info(JSON.stringify(err, null, 4));
        expect(err).to.deep.equal({
          errors: [
            {
              detail: 'Failed to complete HTTP Request',
              status: 'NA',
              title: 'Unable to Process Request',
              code: 'ARIN_2A',
              meta: {
                err: 'error'
              }
            }
          ]
        });
        done();
      });
    });

    it('should return 500 error', (done) => {
      integration._processRequest(null, { statusCode: 500 }, null, null, options, (err, result) => {
        //console.info(JSON.stringify(err, null, 4));
        expect(err).to.deep.equal({
          errors: [
            {
              detail: 'ARIN server was unable to process your request',
              status: '500',
              title: 'Unable to Process Request',
              code: 'ARIN_2A',
              meta: {
                err: null
              }
            }
          ]
        });
        done();
      });
    });

    it('should return empty result for 404 results', (done) => {
      integration._processRequest(null, { statusCode: 404 }, null, { value: 'entity' }, options, (err, result) => {
        //console.info(JSON.stringify(result, null, 4));
        expect(err).to.be.null;
        expect(result).to.deep.equal({
          entity: {
            value: 'entity'
          },
          data: null
        });
        done();
      });
    });

    it('should return error for 400 results', (done) => {
      integration._processRequest(null, { statusCode: 400 }, null, { value: 'entity' }, options, (err, result) => {
        //console.info(JSON.stringify(err, null, 4));
        expect(err).to.deep.equal({
          errors: [
            {
              detail: 'Bad Request',
              status: '400',
              title: 'Bad Request',
              code: 'ARIN_2A',
              meta: {
                entity: 'entity',
                err: null,
                response: {
                  statusCode: 400
                }
              }
            }
          ]
        });
        done();
      });
    });

    it('should return error for non 200 results', (done) => {
      integration._processRequest(null, { statusCode: 580 }, null, { value: 'entity' }, options, (err, result) => {
        //console.info(JSON.stringify(err, null, 4));
        expect(err).to.deep.equal({
          errors: [
            {
              detail: 'Unexpected HTTP Status Code',
              status: '580',
              title: 'Unexpected Status',
              code: 'ARIN_2A',
              meta: {
                statusCode: 580,
                body: null,
                entity: {
                  value: 'entity'
                }
              }
            }
          ]
        });
        done();
      });
    });

    it('should return empty result for undefined body', (done) => {
      integration._processRequest(null, { statusCode: 200 }, undefined, { value: 'entity' }, options, (err, result) => {
        //console.info(JSON.stringify(result, null, 4));
        expect(err).to.be.null;
        expect(result).to.deep.equal({
          entity: {
            value: 'entity'
          },
          data: null
        });
        done();
      });
    });

    it('should return empty result for null body', (done) => {
      integration._processRequest(null, { statusCode: 200 }, null, { value: 'entity' }, options, (err, result) => {
        //console.info(JSON.stringify(result, null, 4));
        expect(err).to.be.null;
        expect(result).to.deep.equal({
          entity: {
            value: 'entity'
          },
          data: null
        });
        done();
      });
    });

    it('should return empty result for undefined body.net', (done) => {
      integration._processRequest(
        null,
        { statusCode: 200 },
        { net: undefined },
        { value: 'entity' },
        options,
        (err, result) => {
          //console.info(JSON.stringify(result, null, 4));
          expect(err).to.be.null;
          expect(result).to.deep.equal({
            entity: {
              value: 'entity'
            },
            data: null
          });
          done();
        }
      );
    });

    it('should return empty result for null body.net', (done) => {
      integration._processRequest(
        null,
        { statusCode: 200 },
        { net: null },
        { value: 'entity' },
        options,
        (err, result) => {
          //console.info(JSON.stringify(result, null, 4));
          expect(err).to.be.null;
          expect(result).to.deep.equal({
            entity: {
              value: 'entity'
            },
            data: null
          });
          done();
        }
      );
    });

    it('should return empty result for undefined body.net.parentNetRef', (done) => {
      integration._processRequest(
        null,
        { statusCode: 200 },
        { net: { parentNetRef: undefined } },
        { value: 'entity' },
        options,
        (err, result) => {
          //console.info(JSON.stringify(result, null, 4));
          expect(err).to.be.null;
          expect(result).to.deep.equal({
            entity: {
              value: 'entity'
            },
            data: null
          });
          done();
        }
      );
    });

    it('should return empty result for null body.net.parentNetRef', (done) => {
      integration._processRequest(
        null,
        { statusCode: 200 },
        { net: { parentNetRef: null } },
        { value: 'entity' },
        options,
        (err, result) => {
          //console.info(JSON.stringify(result, null, 4));
          expect(err).to.be.null;
          expect(result).to.deep.equal({
            entity: {
              value: 'entity'
            },
            data: null
          });
          done();
        }
      );
    });

    it('should return empty result for undefined body.net.orgRef', (done) => {
      integration._processRequest(
        null,
        { statusCode: 200 },
        { net: { orgRef: undefined } },
        { value: 'entity' },
        options,
        (err, result) => {
          //console.info(JSON.stringify(result, null, 4));
          expect(err).to.be.null;
          expect(result).to.deep.equal({
            entity: {
              value: 'entity'
            },
            data: null
          });
          done();
        }
      );
    });

    it('should return empty result for null body.net.orgRef', (done) => {
      integration._processRequest(
        null,
        { statusCode: 200 },
        { net: { orgRef: null } },
        { value: 'entity' },
        options,
        (err, result) => {
          //console.info(JSON.stringify(result, null, 4));
          expect(err).to.be.null;
          expect(result).to.deep.equal({
            entity: {
              value: 'entity'
            },
            data: null
          });
          done();
        }
      );
    });

    it('should return empty result if body is a string', (done) => {
      integration._processRequest(null, { statusCode: 200 }, 'string', { value: 'entity' }, options, (err, result) => {
        //console.info(JSON.stringify(result, null, 4));
        expect(err).to.be.null;
        expect(result).to.deep.equal({
          entity: {
            value: 'entity'
          },
          data: null
        });
        done();
      });
    });

    it('should get cidrLength from netBlock array', (done) => {
      integration._processRequest(
        null,
        { statusCode: 200 },
        {
          net: {
            parentNetRef: '',
            orgRef: '',
            netBlocks: {
              netBlock: [
                {
                  cidrLength: {
                    $: 24
                  }
                }
              ]
            }
          }
        },
        { value: 'entity' },
        options,
        (err, result) => {
          //console.info(JSON.stringify(result, null, 4));
          expect(err).to.be.null;
          expect(result).to.deep.equal({
            entity: {
              value: 'entity'
            },
            data: {
              summary: ['No Org Available'],
              details: {
                allData: {
                  net: {
                    parentNetRef: '',
                    orgRef: '',
                    netBlocks: {
                      netBlock: [
                        {
                          cidrLength: {
                            $: 24
                          }
                        }
                      ]
                    }
                  }
                },
                endAddr: undefined,
                netBlockCIDR: '/24',
                netBlockHandle: undefined,
                netBlockName: undefined,
                netBlockRef: undefined,
                orgHandle: undefined,
                orgName: 'No Org Available',
                orgRef: undefined,
                parentHandle: undefined,
                parentName: undefined,
                parentRef: undefined,
                regDate: undefined,
                startAddr: undefined,
                upDate: undefined
              }
            }
          });
          done();
        }
      );
    });

    it('should get cidrLength from netBlock', (done) => {
      integration._processRequest(
        null,
        { statusCode: 200 },
        {
          net: {
            parentNetRef: '',
            orgRef: '',
            netBlocks: {
              netBlock: {
                cidrLength: {
                  $: 24
                }
              }
            }
          }
        },
        { value: 'entity' },
        options,
        (err, result) => {
          //console.info(JSON.stringify(result, null, 4));
          expect(err).to.be.null;
          expect(result).to.deep.equal({
            entity: {
              value: 'entity'
            },
            data: {
              summary: ['No Org Available'],
              details: {
                allData: {
                  net: {
                    parentNetRef: '',
                    orgRef: '',
                    netBlocks: {
                      netBlock: {
                        cidrLength: {
                          $: 24
                        }
                      }
                    }
                  }
                },
                endAddr: undefined,
                netBlockCIDR: '/24',
                netBlockHandle: undefined,
                netBlockName: undefined,
                netBlockRef: undefined,
                orgHandle: undefined,
                orgName: 'No Org Available',
                orgRef: undefined,
                parentHandle: undefined,
                parentName: undefined,
                parentRef: undefined,
                regDate: undefined,
                startAddr: undefined,
                upDate: undefined
              }
            }
          });
          done();
        }
      );
    });

    it('should handle all missing data', (done) => {
      integration._processRequest(
        null,
        { statusCode: 200 },
        {
          net: {
            parentNetRef: '',
            orgRef: ''
          }
        },
        { value: 'entity' },
        options,
        (err, result) => {
          //console.info(JSON.stringify(result, null, 4));
          expect(err).to.be.null;
          expect(result).to.deep.equal({
            entity: {
              value: 'entity'
            },
            data: {
              summary: ['No Org Available'],
              details: {
                allData: {
                  net: {
                    parentNetRef: '',
                    orgRef: ''
                  }
                },
                endAddr: undefined,
                netBlockCIDR: '/',
                netBlockHandle: undefined,
                netBlockName: undefined,
                netBlockRef: undefined,
                orgHandle: undefined,
                orgName: 'No Org Available',
                orgRef: undefined,
                parentHandle: undefined,
                parentName: undefined,
                parentRef: undefined,
                regDate: undefined,
                startAddr: undefined,
                upDate: undefined
              }
            }
          });
          done();
        }
      );
    });
  });
});
