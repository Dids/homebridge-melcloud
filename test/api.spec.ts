import request from 'supertest'
import { mock } from 'intermock'
import fs from 'fs'
import { ILoginResponse, ILoginData, MELCloudAPIClient } from '../src/api/client'

describe('Login Response', () => {
  // TODO: It's going to suck, but we're going to need to
  //       test all of the API responses and properties..

  const loginResponse = mock({
    files: [
      [
        './src/api/client.ts',
        fs.readFileSync('./src/api/client.ts').toString()
      ],
      [
        './src/config/index.ts',
        fs.readFileSync('./src/config/index.ts').toString()
      ]
    ],
    interfaces: [
      'ILoginResponse',
      'ILoginData',
      // 'IMELCloudConfig',
      'MELCloudLanguage'
    ],
    isOptionalAlwaysEnabled: true
  }) as unknown as ILoginResponse

  console.log('loginResponse:', loginResponse)

  it('should have a valid login response', (done) => {
    // Test that loginResponse is an object and not empty
    expect(loginResponse).toBeDefined()
    expect(loginResponse).not.toBeNull()
    expect(loginResponse).toBeInstanceOf(Object)
    expect(JSON.stringify(loginResponse).length).toBeGreaterThan(2)

    done()
  })


  // TODO: Now that we have the "mocked" type from the interface(s),
  //       we need to somehow be able to compare recursively
  //       that every property and type is the same in the response!

  // const mock = jest.fn<ILoginResponse, []>(() => {
  //   return {
  //     ErrorId: 0,
  //     ErrorMessage: '',
  //     LoginStatus: 0,
  //     UserId: 0,
  //     RandomKey: '',
  //     AppVersionAnnouncement: '',
  //     LoginData: null, // TODO: This should be tested too..
  //     ListPendingInvite: null,
  //     ListOwnershipChangeRequest: null,
  //     ListPendingAnnouncement: null,
  //     LoginMinutes: 0,
  //     LoginAttempts: 0
  //   }
  // })

  // it('should return properties', () => {
  //   const response = mock()
  //   expect(response.ErrorId).toEqual(0)
  //   expect(response.LoginData).toEqual(null)
  // })
})

describe('should do stuff', () => {
  beforeAll(() => {
    console.log('beforeAll')
  })

  it('should do foo', (done) => {
    console.log('foo')
    done()
  })

  it('should do bar', (done) => {
    console.log('bar')

    // const res = mock()
    // console.log('res', res)

    request('https://jsonplaceholder.typicode.com/todos/1')
      .get('/')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).toMatchObject({
          'userId': 1,
          'id': 1,
          'title': 'delectus aut autem',
          'completed': false
        })
        done()
      })
  })
})
