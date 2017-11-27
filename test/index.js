import _ from 'lodash'
import { expect } from 'chai'
import Joi from 'joi'
import SwaggerParser from 'swagger-parser'

import joiToSwagger from '../src'

describe('joi-to-swagger', () => {
  let baseSchema = {
    swagger: '2.0',
    info: {
      title: 'test',
      description: 'Testing',
      version: '1.0.0'
    },
    paths: {}
  }

  it('should exist and export an object', () => {
    expect(joiToSwagger).to.exist.and.be.an('object')
  })

  it('should export getParameterObject', () => {
    expect(joiToSwagger.getParameterObject).to.exist.and.be.a('function')
  })

  it('should generate valid schemas', () => {
    let schema1 = Joi.object().keys({
      id: Joi.number().integer().required(),
      email: Joi.string().email(),
      lowValue: Joi.number().min(2),
      highValue: Joi.number().max(10)
    })

    let swagger1 = _.extend({}, baseSchema, {
      definitions: {
        Schema1: joiToSwagger.getSchemaObject(schema1)
      }
    })

    return SwaggerParser.validate(swagger1)
        .then((api) => {
          expect(api).to.exist.and.be.an('object')
        })
  })
})
