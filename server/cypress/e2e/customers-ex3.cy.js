describe('Customers API', () => {
  const api = Cypress.env('apiUrl')

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

  context('Successful requests', () => {
    it('retrieve customers with default query strings and return expected pageInfo and customers array', () => {
      // Arrange
      // let the API apply defaults

      // Act
      cy.request({ method: 'GET', url: `${api}/customers` })
        .then(response => {
          // Assert
          const { status, body: { customers, pageInfo } } = response
          expect(status).to.equal(200)

          expect(Array.isArray(customers)).to.equal(true)
          expect(pageInfo).to.have.property('currentPage').that.is.a('number')
          expect(pageInfo).to.have.property('totalPages').that.is.a('number')
          expect(pageInfo).to.have.property('totalCustomers').that.is.a('number')

          customers.forEach(customer => {
            const { id, name, employees, industry, size } = customer
            expect(id).to.be.a('number')
            expect(name).to.be.a('string')
            expect(employees).to.be.a('number')
            expect(industry).to.be.a('string')
            expect(size).to.be.a('string')
          })
        })
    })

    it('retrieve static customers by id (1-8) and return exact fields and values', () => {
      // Arrange
      const url = `${api}/customers?limit=50`

      // Act
      cy.request({ method: 'GET', url })
        .then(response => {
          // Assert
          const { status, body: { customers } } = response
          expect(status).to.equal(200)
          expect(Array.isArray(customers)).to.equal(true)

          Object.values(expectedStaticCustomers).forEach(expected => {
            const { id } = expected
            const customer = customers.find(c => c.id === id)
            expect(customer, `customer with id ${id} should be present`).to.exist

            const { name, employees, industry, contactInfo, address, size } = customer
            expect(name).to.equal(expected.name)
            expect(employees).to.equal(expected.employees)
            expect(industry).to.equal(expected.industry)
            expect(size).to.equal(expected.size)

            if (expected.contactInfo === null) {
              expect(contactInfo).to.equal(null)
            } else {
              expect(contactInfo).to.be.an('object')
              const { name: cName, email } = contactInfo
              expect(cName).to.equal(expected.contactInfo.name)
              expect(email).to.equal(expected.contactInfo.email)
            }

            expect(address).to.be.an('object')
            const { street, city, state, zipCode, country } = address
            expect(street).to.equal(expected.address.street)
            expect(city).to.equal(expected.address.city)
            expect(state).to.equal(expected.address.state)
            expect(zipCode).to.equal(expected.address.zipCode)
            expect(country).to.equal(expected.address.country)
          })
        })
    })

    it('retrieve customers filtered by size and return employees within expected boundaries including boundary values', () => {
      // Arrange
      const sizeCases = {
        Small: { min: 1, max: 99 },
        Medium: { min: 100, max: 999 },
        Enterprise: { min: 1000, max: 9999 },
        'Large Enterprise': { min: 10000, max: 49999 },
        'Very Large Enterprise': { min: 50000, max: 100000 }
      }

      // Act
      Object.keys(sizeCases).forEach(size => {
        const url = `${api}/customers?size=${encodeURIComponent(size)}&limit=50`
        cy.request({ method: 'GET', url })
          .then(response => {
            // Assert
            const { status, body: { customers } } = response
            expect(status).to.equal(200)
            expect(Array.isArray(customers)).to.equal(true)
            customers.forEach(({ size: cSize, employees }) => {
              expect(cSize).to.equal(size)
              const { min, max } = sizeCases[size]
              expect(employees).to.be.at.least(min)
              expect(employees).to.be.at.most(max)
            })
          })
      })
    })

    it('retrieve customers filtered by industry and return only customers from that industry', () => {
      // Arrange
      const industry = 'Technology'
      const url = `${api}/customers?industry=${encodeURIComponent(industry)}&limit=50`

      // Act
      cy.request({ method: 'GET', url })
        .then(response => {
          // Assert
          const { status, body: { customers } } = response
          expect(status).to.equal(200)
          expect(Array.isArray(customers)).to.equal(true)
          customers.forEach(({ industry: cIndustry }) => {
            expect(cIndustry).to.equal(industry)
          })
        })
    })

    it('retrieve a specific page and limit and return correct pagination info and item count', () => {
      // Arrange
      const limit = 4
      const page = 2
      const url = `${api}/customers?page=${page}&limit=${limit}`

      // Act
      cy.request({ method: 'GET', url })
        .then(response => {
          // Assert
          const { status, body: { customers, pageInfo } } = response
          expect(status).to.equal(200)
          expect(Array.isArray(customers)).to.equal(true)
          expect(pageInfo).to.have.property('currentPage').that.equals(page)
          expect(pageInfo).to.have.property('totalCustomers').that.is.a('number')
          expect(pageInfo).to.have.property('totalPages').that.equals(Math.ceil(pageInfo.totalCustomers / limit))
          expect(customers.length).to.be.at.most(limit)
        })
    })
  })

  context('Error requests and validation', () => {
    it('return 400 when page equals 0 and include error message', () => {
      // Arrange
      const url = `${api}/customers?page=0`

      // Act
      cy.request({ method: 'GET', url, failOnStatusCode: false })
        .then(response => {
          // Assert
          const { status, body: { error } } = response
          expect(status).to.equal(400)
          expect(error).to.be.a('string')
        })
    })

    it('return 400 when page equals -1 and include error message', () => {
      // Arrange
      const url = `${api}/customers?page=-1`

      // Act
      cy.request({ method: 'GET', url, failOnStatusCode: false })
        .then(response => {
          // Assert
          const { status, body: { error } } = response
          expect(status).to.equal(400)
          expect(error).to.be.a('string')
        })
    })

    it('return 400 when limit equals 0 and include error message', () => {
      // Arrange
      const url = `${api}/customers?limit=0`

      // Act
      cy.request({ method: 'GET', url, failOnStatusCode: false })
        .then(response => {
          // Assert
          const { status, body: { error } } = response
          expect(status).to.equal(400)
          expect(error).to.be.a('string')
        })
    })

    it('return 400 when limit equals -1 and include error message', () => {
      // Arrange
      const url = `${api}/customers?limit=-1`

      // Act
      cy.request({ method: 'GET', url, failOnStatusCode: false })
        .then(response => {
          // Assert
          const { status, body: { error } } = response
          expect(status).to.equal(400)
          expect(error).to.be.a('string')
        })
    })

    it('return 400 when size has invalid value and include informative message', () => {
      // Arrange
      const url = `${api}/customers?size=InvalidSize`

      // Act
      cy.request({ method: 'GET', url, failOnStatusCode: false })
        .then(response => {
          // Assert
          const { status, body: { error } } = response
          expect(status).to.equal(400)
          expect(error).to.be.a('string')
        })
    })

    it('return 400 when industry has invalid value and include informative message', () => {
      // Arrange
      const url = `${api}/customers?industry=UnknownIndustry`

      // Act
      cy.request({ method: 'GET', url, failOnStatusCode: false })
        .then(response => {
          // Assert
          const { status, body: { error } } = response
          expect(status).to.equal(400)
          expect(error).to.be.a('string')
        })
    })

    it('return 400 when page or limit are non-numeric and include informative messages', () => {
      // Arrange
      const urlPage = `${api}/customers?page=abc`
      const urlLimit = `${api}/customers?limit=xyz`

      // Act
      cy.request({ method: 'GET', url: urlPage, failOnStatusCode: false })
        .then(responsePage => {
          // Assert
          const { status: statusPage, body: { error: errorPage } } = responsePage
          expect(statusPage).to.equal(400)
          expect(errorPage).to.be.a('string')
        })

      cy.request({ method: 'GET', url: urlLimit, failOnStatusCode: false })
        .then(responseLimit => {
          // Assert
          const { status: statusLimit, body: { error: errorLimit } } = responseLimit
          expect(statusLimit).to.equal(400)
          expect(errorLimit).to.be.a('string')
        })
    })
  })
})