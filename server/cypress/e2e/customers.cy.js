describe('GET /customers', () => {
  describe('Valid requests', () => {
    it('should return customers with default pagination (page=1, limit=10)', () => {
      cy.request('GET', '/customers').then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body).to.have.property('customers')
        expect(response.body).to.have.property('pageInfo')
        expect(response.body.customers).to.be.an('array')
        expect(response.body.customers.length).to.be.at.most(10)
        expect(response.body.pageInfo).to.have.property('currentPage', 1)
        expect(response.body.pageInfo).to.have.property('totalPages')
        expect(response.body.pageInfo).to.have.property('totalCustomers')
      })
    })

    it('should return customers with custom pagination', () => {
      cy.request('GET', '/customers?page=2&limit=5').then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.customers.length).to.be.at.most(5)
        expect(response.body.pageInfo.currentPage).to.equal(2)
      })
    })

    const sizes = ['Small', 'Medium', 'Enterprise', 'Large Enterprise', 'Very Large Enterprise']
    sizes.forEach((size) => {
      it(`should filter customers by size: ${size}`, () => {
        cy.request('GET', `/customers?size=${encodeURIComponent(size)}`).then((response) => {
          expect(response.status).to.equal(200)
          response.body.customers.forEach((customer) => {
            expect(customer.size).to.equal(size)
          })
        })
      })
    })

    const industries = ['Technology', 'Logistics', 'Retail', 'HR', 'Finance']
    industries.forEach((industry) => {
      it(`should filter customers by industry: ${industry}`, () => {
        cy.request('GET', `/customers?industry=${industry}`).then((response) => {
          expect(response.status).to.equal(200)
          response.body.customers.forEach((customer) => {
            expect(customer.industry).to.equal(industry)
          })
        })
      })
    })

    it('should filter customers by size and industry combined', () => {
      cy.request('GET', '/customers?size=Medium&industry=Technology').then((response) => {
        expect(response.status).to.equal(200)
        response.body.customers.forEach((customer) => {
          expect(customer.size).to.equal('Medium')
          expect(customer.industry).to.equal('Technology')
        })
      })
    })

    it('should return correct customer object structure', () => {
      cy.request('GET', '/customers').then((response) => {
        expect(response.status).to.equal(200)
        if (response.body.customers.length > 0) {
          const customer = response.body.customers[0]
          expect(customer).to.have.property('id')
          expect(customer).to.have.property('name')
          expect(customer).to.have.property('employees')
          expect(customer).to.have.property('contactInfo')
          expect(customer).to.have.property('size')
          expect(customer).to.have.property('industry')
          expect(customer).to.have.property('address')
        }
      })
    })

    it('should return address object with correct structure when present', () => {
      cy.request('GET', '/customers').then((response) => {
        expect(response.status).to.equal(200)
        const customerWithAddress = response.body.customers.find((c) => c.address !== null)
        if (customerWithAddress) {
          expect(customerWithAddress.address).to.have.property('street')
          expect(customerWithAddress.address).to.have.property('city')
          expect(customerWithAddress.address).to.have.property('state')
          expect(customerWithAddress.address).to.have.property('zipCode')
          expect(customerWithAddress.address).to.have.property('country')
        }
      })
    })

    it('should return contactInfo object with correct structure when present', () => {
      cy.request('GET', '/customers').then((response) => {
        expect(response.status).to.equal(200)
        const customerWithContact = response.body.customers.find((c) => c.contactInfo !== null)
        if (customerWithContact) {
          expect(customerWithContact.contactInfo).to.have.property('name')
          expect(customerWithContact.contactInfo).to.have.property('email')
        }
      })
    })

    it('should handle pagination correctly across multiple pages', () => {
      cy.request('GET', '/customers?page=1&limit=10').then((response) => {
        const totalPages = response.body.pageInfo.totalPages
        expect(totalPages).to.be.greaterThan(0)
        cy.request('GET', `/customers?page=${totalPages}&limit=10`).then((lastPageResponse) => {
          expect(lastPageResponse.status).to.equal(200)
          expect(lastPageResponse.body.pageInfo.currentPage).to.equal(totalPages)
        })
      })
    })

    it('should handle limit parameter correctly', () => {
      cy.request('GET', '/customers?limit=20').then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.customers.length).to.be.at.most(20)
      })
    })
  })

  describe('Invalid requests', () => {
    it('should return 400 for negative page number', () => {
      cy.request({
        method: 'GET',
        url: '/customers?page=-1',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400)
      })
    })

    it('should return 400 for non-number page value', () => {
      cy.request({
        method: 'GET',
        url: '/customers?page=abc',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400)
      })
    })

    it('should return 400 for negative limit number', () => {
      cy.request({
        method: 'GET',
        url: '/customers?limit=-5',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400)
      })
    })

    it('should return 400 for non-number limit value', () => {
      cy.request({
        method: 'GET',
        url: '/customers?limit=xyz',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400)
      })
    })

    it('should return 400 for invalid size value', () => {
      cy.request({
        method: 'GET',
        url: '/customers?size=Invalid',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400)
      })
    })

    it('should return 400 for invalid industry value', () => {
      cy.request({
        method: 'GET',
        url: '/customers?industry=InvalidIndustry',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400)
      })
    })

    it('should return 400 for zero limit', () => {
      cy.request({
        method: 'GET',
        url: '/customers?limit=0',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400)
      })
    })

    it('should return 400 for zero page', () => {
      cy.request({
        method: 'GET',
        url: '/customers?page=0',
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400)
      })
    })
  })

  describe('Size attribute validation', () => {
    it('employees < 100 should return Small size', () => {
      cy.request('GET', '/customers?size=Small').then((response) => {
        expect(response.status).to.equal(200)
        response.body.customers.forEach((customer) => {
          expect(customer.employees).to.be.below(100)
          expect(customer.size).to.equal('Small')
        })
      })
    })

    it('employees >= 100 and < 1000 should return Medium size', () => {
      cy.request('GET', '/customers?size=Medium').then((response) => {
        expect(response.status).to.equal(200)
        response.body.customers.forEach((customer) => {
          expect(customer.employees).to.be.at.least(100)
          expect(customer.employees).to.be.below(1000)
          expect(customer.size).to.equal('Medium')
        })
      })
    })

    it('employees >= 1000 and < 10000 should return Enterprise size', () => {
      cy.request('GET', '/customers?size=Enterprise').then((response) => {
        expect(response.status).to.equal(200)
        response.body.customers.forEach((customer) => {
          expect(customer.employees).to.be.at.least(1000)
          expect(customer.employees).to.be.below(10000)
          expect(customer.size).to.equal('Enterprise')
        })
      })
    })

    it('employees >= 10000 and < 50000 should return Large Enterprise size', () => {
      cy.request('GET', '/customers?size=Large Enterprise').then((response) => {
        expect(response.status).to.equal(200)
        response.body.customers.forEach((customer) => {
          expect(customer.employees).to.be.at.least(10000)
          expect(customer.employees).to.be.below(50000)
          expect(customer.size).to.equal('Large Enterprise')
        })
      })
    })

    it('employees >= 50000 should return Very Large Enterprise size', () => {
      cy.request('GET', '/customers?size=Very Large Enterprise').then((response) => {
        expect(response.status).to.equal(200)
        response.body.customers.forEach((customer) => {
          expect(customer.employees).to.be.at.least(50000)
          expect(customer.size).to.equal('Very Large Enterprise')
        })
      })
    })
  })

  describe('Response body validation', () => {
    it('should return valid pageInfo structure', () => {
      cy.request('GET', '/customers').then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.pageInfo).to.have.property('currentPage')
        expect(response.body.pageInfo).to.have.property('totalPages')
        expect(response.body.pageInfo).to.have.property('totalCustomers')
        expect(response.body.pageInfo.currentPage).to.be.a('number')
        expect(response.body.pageInfo.totalPages).to.be.a('number')
        expect(response.body.pageInfo.totalCustomers).to.be.a('number')
      })
    })

    it('should return customers array', () => {
      cy.request('GET', '/customers').then((response) => {
        expect(response.status).to.equal(200)
        expect(response.body.customers).to.be.an('array')
      })
    })

    it('customer name should be a string', () => {
      cy.request('GET', '/customers').then((response) => {
        expect(response.status).to.equal(200)
        response.body.customers.forEach((customer) => {
          expect(customer.name).to.be.a('string')
        })
      })
    })

    it('customer employees should be a number', () => {
      cy.request('GET', '/customers').then((response) => {
        expect(response.status).to.equal(200)
        response.body.customers.forEach((customer) => {
          expect(customer.employees).to.be.a('number')
        })
      })
    })

    it('customer size should be one of the valid sizes', () => {
      const validSizes = ['Small', 'Medium', 'Enterprise', 'Large Enterprise', 'Very Large Enterprise']
      cy.request('GET', '/customers').then((response) => {
        expect(response.status).to.equal(200)
        response.body.customers.forEach((customer) => {
          expect(validSizes).to.include(customer.size)
        })
      })
    })

    it('customer industry should be one of the valid industries', () => {
      const validIndustries = ['Logistics', 'Retail', 'Technology', 'HR', 'Finance']
      cy.request('GET', '/customers').then((response) => {
        expect(response.status).to.equal(200)
        response.body.customers.forEach((customer) => {
          expect(validIndustries).to.include(customer.industry)
        })
      })
    })

    it('contactInfo should be null or an object with name and email', () => {
      cy.request('GET', '/customers').then((response) => {
        expect(response.status).to.equal(200)
        response.body.customers.forEach((customer) => {
          if (customer.contactInfo !== null) {
            expect(customer.contactInfo).to.be.an('object')
            expect(customer.contactInfo).to.have.property('name')
            expect(customer.contactInfo).to.have.property('email')
          }
        })
      })
    })

    it('address should be null or an object with street, city, state, zipCode, country', () => {
      cy.request('GET', '/customers').then((response) => {
        expect(response.status).to.equal(200)
        response.body.customers.forEach((customer) => {
          if (customer.address !== null) {
            expect(customer.address).to.be.an('object')
            expect(customer.address).to.have.property('street')
            expect(customer.address).to.have.property('city')
            expect(customer.address).to.have.property('state')
            expect(customer.address).to.have.property('zipCode')
            expect(customer.address).to.have.property('country')
          }
        })
      })
    })
  })
})
