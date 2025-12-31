import { test, expect } from '@playwright/test'

const api = process.env.API_URL || 'http://localhost:3001'

const expectedStaticCustomers = {
  1: {
    id: 1,
    name: 'Jacobs Co',
    employees: 99,
    industry: 'Logistics',
    contactInfo: null,
    address: {
      street: '988 Kimberly Fort Apt. 921',
      city: 'Lake Tracy',
      state: 'Connecticut',
      zipCode: '07115',
      country: 'United States of America'
    },
    size: 'Small'
  },
  2: {
    id: 2,
    name: 'Kilback Co',
    employees: 100,
    industry: 'Retail',
    contactInfo: {
      name: 'Daija',
      email: 'Daija_Gislason93@gmail.com'
    },
    address: {
      street: '5099 Murray Inlet',
      city: 'South Tiffany',
      state: 'Kentucky',
      zipCode: '08496',
      country: 'United States of America'
    },
    size: 'Medium'
  },
  3: {
    id: 3,
    name: 'Parisian Co',
    employees: 999,
    industry: 'Technology',
    contactInfo: {
      name: 'Alysson',
      email: 'Alysson.Lang@hotmail.com'
    },
    address: {
      street: '43247 Bennett Keys Apt. 999',
      city: 'New Paulside',
      state: 'Connecticut',
      zipCode: '87855',
      country: 'United States of America'
    },
    size: 'Medium'
  },
  4: {
    id: 4,
    name: 'Wilderman Co',
    employees: 1000,
    industry: 'HR',
    contactInfo: {
      name: 'Brando',
      email: 'Brando_Kozey48@gmail.com'
    },
    address: {
      street: '8643 Jackson Wall',
      city: 'Lake Davidstad',
      state: 'Minnesota',
      zipCode: '29481',
      country: 'United States of America'
    },
    size: 'Enterprise'
  },
  5: {
    id: 5,
    name: 'Runolfsson Co',
    employees: 9999,
    industry: 'Finance',
    contactInfo: null,
    address: {
      street: '851 John Shores Suite 956',
      city: 'New Mariah',
      state: 'Ohio',
      zipCode: '78314',
      country: 'United States of America'
    },
    size: 'Enterprise'
  },
  6: {
    id: 6,
    name: 'Littel Co',
    employees: 10000,
    industry: 'Logistics',
    contactInfo: {
      name: 'Selena',
      email: 'Selena.Gleichner7@gmail.com'
    },
    address: {
      street: '14135 Kari Garden Suite 427',
      city: 'Mooreshire',
      state: 'Nevada',
      zipCode: '64043',
      country: 'United States of America'
    },
    size: 'Large Enterprise'
  },
  7: {
    id: 7,
    name: 'Weber Co',
    employees: 49999,
    industry: 'Retail',
    contactInfo: {
      name: 'Malika',
      email: 'Malika16@hotmail.com'
    },
    address: {
      street: '70738 Mike Rue',
      city: 'Whitechester',
      state: 'Kentucky',
      zipCode: '57787',
      country: 'United States of America'
    },
    size: 'Large Enterprise'
  },
  8: {
    id: 8,
    name: 'Lowe Co',
    employees: 50000,
    industry: 'Technology',
    contactInfo: null,
    address: {
      street: '87908 Adkins Islands Apt. 944',
      city: 'West Sarah',
      state: 'Georgia',
      zipCode: '79943',
      country: 'United States of America'
    },
    size: 'Very Large Enterprise'
  }
}

test.describe('Customers API - Successful requests', () => {
  test('retrieve customers with default query strings and return expected pageInfo and customers array', async ({ request }) => {
    // Arrange
    // let the API apply defaults

    // Act
    const response = await request.get(`${api}/customers`)
    const status = response.status()
    const body = await response.json()
    const { customers, pageInfo } = body

    // Assert
    expect(status).toBe(200)
    expect(Array.isArray(customers)).toBe(true)
    expect(pageInfo).toHaveProperty('currentPage')
    expect(typeof pageInfo.currentPage).toBe('number')
    expect(pageInfo).toHaveProperty('totalPages')
    expect(typeof pageInfo.totalPages).toBe('number')
    expect(pageInfo).toHaveProperty('totalCustomers')
    expect(typeof pageInfo.totalCustomers).toBe('number')

    customers.forEach(customer => {
      const { id, name, employees, industry, size } = customer
      expect(typeof id).toBe('number')
      expect(typeof name).toBe('string')
      expect(typeof employees).toBe('number')
      expect(typeof industry).toBe('string')
      expect(typeof size).toBe('string')
    })
  })

  test('retrieve static customers by id (1-8) and return exact fields and values', async ({ request }) => {
    // Arrange
    const url = `${api}/customers?limit=50`

    // Act
    const response = await request.get(url)
    const status = response.status()
    const body = await response.json()
    const { customers } = body

    // Assert
    expect(status).toBe(200)
    expect(Array.isArray(customers)).toBe(true)

    for (const expected of Object.values(expectedStaticCustomers)) {
      const { id } = expected
      const customer = customers.find(c => c.id === id)
      expect(customer, `customer with id ${id} should be present`).toBeTruthy()

      const { name, employees, industry, contactInfo, address, size } = customer
      expect(name).toBe(expected.name)
      expect(employees).toBe(expected.employees)
      expect(industry).toBe(expected.industry)
      expect(size).toBe(expected.size)

      if (expected.contactInfo === null) {
        expect(contactInfo).toBeNull()
      } else {
        expect(typeof contactInfo).toBe('object')
        expect(contactInfo.name).toBe(expected.contactInfo.name)
        expect(contactInfo.email).toBe(expected.contactInfo.email)
      }

      expect(typeof address).toBe('object')
      expect(address.street).toBe(expected.address.street)
      expect(address.city).toBe(expected.address.city)
      expect(address.state).toBe(expected.address.state)
      expect(address.zipCode).toBe(expected.address.zipCode)
      expect(address.country).toBe(expected.address.country)
    }
  })

  test('retrieve customers filtered by size and return employees within expected boundaries including boundary values', async ({ request }) => {
    // Arrange
    const sizeCases = {
      Small: { min: 1, max: 99 },
      Medium: { min: 100, max: 999 },
      Enterprise: { min: 1000, max: 9999 },
      'Large Enterprise': { min: 10000, max: 49999 },
      'Very Large Enterprise': { min: 50000, max: 100000 }
    }

    // Act / Assert
    for (const size of Object.keys(sizeCases)) {
      const url = `${api}/customers?size=${encodeURIComponent(size)}&limit=50`
      const response = await request.get(url)
      const status = response.status()
      const body = await response.json()
      const { customers } = body

      expect(status).toBe(200)
      expect(Array.isArray(customers)).toBe(true)

      customers.forEach(c => {
        const { size: cSize, employees } = c
        expect(cSize).toBe(size)
        const { min, max } = sizeCases[size]
        expect(employees).toBeGreaterThanOrEqual(min)
        expect(employees).toBeLessThanOrEqual(max)
      })
    }
  })

  test('retrieve customers filtered by industry and return only customers from that industry', async ({ request }) => {
    // Arrange
    const industry = 'Technology'
    const url = `${api}/customers?industry=${encodeURIComponent(industry)}&limit=50`

    // Act
    const response = await request.get(url)
    const status = response.status()
    const body = await response.json()
    const { customers } = body

    // Assert
    expect(status).toBe(200)
    expect(Array.isArray(customers)).toBe(true)
    customers.forEach(({ industry: cIndustry }) => {
      expect(cIndustry).toBe(industry)
    })
  })

  test('retrieve a specific page and limit and return correct pagination info and item count', async ({ request }) => {
    // Arrange
    const limit = 4
    const page = 2
    const url = `${api}/customers?page=${page}&limit=${limit}`

    // Act
    const response = await request.get(url)
    const status = response.status()
    const body = await response.json()
    const { customers, pageInfo } = body

    // Assert
    expect(status).toBe(200)
    expect(Array.isArray(customers)).toBe(true)
    expect(pageInfo.currentPage).toBe(page)
    expect(typeof pageInfo.totalCustomers).toBe('number')
    expect(pageInfo.totalPages).toBe(Math.ceil(pageInfo.totalCustomers / limit))
    expect(customers.length).toBeLessThanOrEqual(limit)
  })

  test('retrieve customers with limit and return number of items respecting limit', async ({ request }) => {
    // Arrange
    const limit = 3
    const url = `${api}/customers?limit=${limit}`

    // Act
    const response = await request.get(url)
    const status = response.status()
    const body = await response.json()
    const { customers, pageInfo } = body

    // Assert
    expect(status).toBe(200)
    expect(Array.isArray(customers)).toBe(true)
    expect(customers.length).toBeLessThanOrEqual(limit)
    expect(pageInfo.totalPages).toBe(Math.ceil(pageInfo.totalCustomers / limit))
  })
})

test.describe('Customers API - Error requests and validation', () => {
  test('return 400 when page equals 0 and include error message', async ({ request }) => {
    // Arrange
    const url = `${api}/customers?page=0`

    // Act
    const response = await request.get(url)
    const status = response.status()
    const body = await response.json()
    const { error } = body

    // Assert
    expect(status).toBe(400)
    expect(typeof error).toBe('string')
  })

  test('return 400 when page equals -1 and include error message', async ({ request }) => {
    // Arrange
    const url = `${api}/customers?page=-1`

    // Act
    const response = await request.get(url)
    const status = response.status()
    const body = await response.json()
    const { error } = body

    // Assert
    expect(status).toBe(400)
    expect(typeof error).toBe('string')
  })

  test('return 400 when limit equals 0 and include error message', async ({ request }) => {
    // Arrange
    const url = `${api}/customers?limit=0`

    // Act
    const response = await request.get(url)
    const status = response.status()
    const body = await response.json()
    const { error } = body

    // Assert
    expect(status).toBe(400)
    expect(typeof error).toBe('string')
  })

  test('return 400 when limit equals -1 and include error message', async ({ request }) => {
    // Arrange
    const url = `${api}/customers?limit=-1`

    // Act
    const response = await request.get(url)
    const status = response.status()
    const body = await response.json()
    const { error } = body

    // Assert
    expect(status).toBe(400)
    expect(typeof error).toBe('string')
  })

  test('return 400 when size has invalid value and include informative message', async ({ request }) => {
    // Arrange
    const url = `${api}/customers?size=InvalidSize`

    // Act
    const response = await request.get(url)
    const status = response.status()
    const body = await response.json()
    const { error } = body

    // Assert
    expect(status).toBe(400)
    expect(typeof error).toBe('string')
  })

  test('return 400 when industry has invalid value and include informative message', async ({ request }) => {
    // Arrange
    const url = `${api}/customers?industry=UnknownIndustry`

    // Act
    const response = await request.get(url)
    const status = response.status()
    const body = await response.json()
    const { error } = body

    // Assert
    expect(status).toBe(400)
    expect(typeof error).toBe('string')
  })

  test('return 400 when page or limit are non-numeric and include informative messages', async ({ request }) => {
    // Arrange
    const urlPage = `${api}/customers?page=abc`
    const urlLimit = `${api}/customers?limit=xyz`

    // Act
    const responsePage = await request.get(urlPage)
    const statusPage = responsePage.status()
    const bodyPage = await responsePage.json()
    const { error: errorPage } = bodyPage

    const responseLimit = await request.get(urlLimit)
    const statusLimit = responseLimit.status()
    const bodyLimit = await responseLimit.json()
    const { error: errorLimit } = bodyLimit

    // Assert
    expect(statusPage).toBe(400)
    expect(typeof errorPage).toBe('string')
    expect(statusLimit).toBe(400)
    expect(typeof errorLimit).toBe('string')
  })
})