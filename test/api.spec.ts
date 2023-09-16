/* eslint-disable no-console */
import { mock } from 'intermock'
import fs from 'fs'
import {
  MELCloudAPIClient, ILoginResponse, 
} from '../src/api/client'
import {
  IMELCloudConfig, MELCloudLanguage, 
} from '../src/config'

import withLocalTmpDir from 'with-local-tmp-dir'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Get API credentials (if any)
const APICredentials = {
  Username: process.env.MELCLOUD_EMAIL,
  Password: process.env.MELCLOUD_PASSWORD,
}
const HasAPICredentials = (APICredentials.Username !== undefined && APICredentials.Password !== undefined)

// FIXME: This plugin is mostly working, but the online/offline status is NOT working for some reason?!

describe('Mock API', () => {
  describe('Login Response', () => {
    // TODO: It's going to suck, but we're going to need to
    //       test all of the API responses and properties..

    const loginResponse = mock({
      files: [
        [
          './src/api/client.ts',
          fs.readFileSync('./src/api/client.ts').toString(),
        ],
        [
          './src/config/index.ts',
          fs.readFileSync('./src/config/index.ts').toString(),
        ],
      ],
      interfaces: [
        'ILoginResponse',
        'ILoginData',
        // 'IMELCloudConfig',
        'MELCloudLanguage',
      ],
      isOptionalAlwaysEnabled: true,
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
})

// Only include real API tests if we have the API credentials available
if (HasAPICredentials) {
  describe('Real API', () => {
    describe('Login Response', () => {
      // TODO: Test the real API here, so long as we have the credentials etc.
      //       otherwise just skip this test if the credentials are not set?

      const logger = {
        info: (...args: Array<unknown>): void => console.info('INFO:', ...args),
        warn: (...args: Array<unknown>): void => console.warn('WARNING:', ...args),
        error: (...args: Array<unknown>): void => console.error('ERROR:', ...args),
        debug: (...args: Array<unknown>): void => console.debug('DEBUG:', ...args),
        log: (...args: Array<unknown>): void => console.log('LOG:', ...args),
      }

      const validConfig = {
        username: APICredentials.Username,
        password: APICredentials.Password,
        language: MELCloudLanguage.English,
        debug: true,
      } as IMELCloudConfig

      const invalidConfig = {
        username: 'foo@bar',
        password: 'foobar',
        language: MELCloudLanguage.English,
        debug: true,
      } as IMELCloudConfig

      // Create a 

      // const storagePath = './tmp'

      // TODO: Test creating the client without a logger, config and storage path, all separate tests

      it('should be able to create a valid client', async () => {
        await withLocalTmpDir(async () => {
          const storagePath = process.cwd()
          const client = new MELCloudAPIClient(logger, invalidConfig, storagePath)
          await client.init()

          // Test that loginResponse is an object and not empty
          expect(client).toBeDefined()
          expect(client).not.toBeNull()
        //   expect(client).toBeInstanceOf(Object) // FIXME: Jest globals are different from Node globals
        })
      })

      it('should fail login with invalid credentials', async () => {
        await withLocalTmpDir(async () => {
          const storagePath = process.cwd()
          const client = new MELCloudAPIClient(logger, invalidConfig, storagePath)
          await client.init()

          // const loginResponse = await client.login()
          // await expect(client.login()).rejects.toMatch('errror')
          await expect(client.login()).rejects.toThrowError('Login failed due to invalid credentials.')
        })
      })

      it('should succeed login with valid credentials', async () => {
        await withLocalTmpDir(async () => {
          const storagePath = process.cwd()
          const client = new MELCloudAPIClient(logger, validConfig, storagePath)
          await client.init()
          
          const loginResponse = await client.login()
          // const loginResponse = await expect(client.login()).resolves.toBeDefined()

          // Test that loginResponse is an object and not empty
          expect(loginResponse).toBeDefined()
          expect(loginResponse).not.toBeNull()
          //   expect(loginResponse).toBeInstanceOf(Object) // FIXME: Jest globals are different from Node globals
          expect(JSON.stringify(loginResponse).length).toBeGreaterThan(2)
        })
      })

      it('should be able to list and get devices', async () => {
        await withLocalTmpDir(async () => {
          const storagePath = process.cwd()
          const client = new MELCloudAPIClient(logger, validConfig, storagePath)
          await client.init()
          
          await client.login()
          const devices = await client.listDevices() // TODO: Rename this to "listBuildings" etc. to match the underlying data!
          console.log('DEVICES:', devices)

          // Test that device list is an array and not empty
          expect(devices).toBeDefined()
          expect(devices).not.toBeNull()
          //   expect(devices).toBeInstanceOf(Array) // FIXME: Jest globals are different from Node globals
          expect(JSON.stringify(devices).length).toBeGreaterThan(2)

          // Test that the first device list item is an object and not empty
          const firstBuilding = devices[0]
          console.log('FIRST BUILDING:', firstBuilding)
          expect(firstBuilding).toBeDefined()
          expect(firstBuilding).not.toBeNull()
          //   expect(firstBuilding).toBeInstanceOf(Object) // FIXME: Jest globals are different from Node globals
          expect(JSON.stringify(firstBuilding).length).toBeGreaterThan(2)

          const firstDeviceID = firstBuilding.Structure?.Devices?.[0]?.DeviceID
          console.log('FIRST DEVICE ID:', firstDeviceID)
          expect(firstDeviceID).toBeDefined()
          expect(firstDeviceID).not.toBeNull()
          expect(firstDeviceID).toEqual(expect.any(Number))
          expect(firstDeviceID).toBeGreaterThan(0)

          const deviceDetails = await client.getDevice(firstDeviceID ?? null, firstBuilding.ID)
          console.log('DEVICE DETAILS:', deviceDetails)
          expect(deviceDetails).toBeDefined()
          expect(deviceDetails).not.toBeNull()
          //   expect(deviceDetails).toBeInstanceOf(Object) // FIXME: Jest globals are different from Node globals
          expect(JSON.stringify(deviceDetails).length).toBeGreaterThan(2)
        })
      })

      // const loginResponse = mock({
      //   files: [
      //     [
      //       './src/api/client.ts',
      //       fs.readFileSync('./src/api/client.ts').toString()
      //     ],
      //     [
      //       './src/config/index.ts',
      //       fs.readFileSync('./src/config/index.ts').toString()
      //     ]
      //   ],
      //   interfaces: [
      //     'ILoginResponse',
      //     'ILoginData',
      //     // 'IMELCloudConfig',
      //     'MELCloudLanguage'
      //   ],
      //   isOptionalAlwaysEnabled: true
      // }) as unknown as ILoginResponse

      // console.log('loginResponse:', loginResponse)

      // it('should have a valid login response', (done) => {
      //   // Test that loginResponse is an object and not empty
      //   expect(loginResponse).toBeDefined()
      //   expect(loginResponse).not.toBeNull()
      //   expect(loginResponse).toBeInstanceOf(Object)
      //   expect(JSON.stringify(loginResponse).length).toBeGreaterThan(2)

      //   done()
      // })
    })
  })
}

// describe('should do stuff', () => {
//   beforeAll(() => {
//     console.log('beforeAll')
//   })

//   it('should do foo', (done) => {
//     console.log('foo')
//     done()
//   })

//   it('should do bar', (done) => {
//     console.log('bar')

//     // const res = mock()
//     // console.log('res', res)

//     request('https://jsonplaceholder.typicode.com/todos/1')
//       .get('/')
//       .expect(200)
//       .end((err, res) => {
//         if (err) return done(err)
//         expect(res.body).toMatchObject({
//           'userId': 1,
//           'id': 1,
//           'title': 'delectus aut autem',
//           'completed': false
//         })
//         done()
//       })
//   })
// })
