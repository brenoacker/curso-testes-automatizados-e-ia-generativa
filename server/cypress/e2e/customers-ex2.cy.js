describe('GET /customers - Exercício 2', () => {
  const apiUrl = Cypress.env('apiUrl')

  describe('Valid requests', () => {
    it('returns customers with default pagination', () => {
      cy.request('GET', `${apiUrl}/customers`).then(({ status, body }) => {
        const { customers, pageInfo } = body

        expect(status).to.equal(200)
        expect(customers).to.be.an('array')
        expect(pageInfo.currentPage).to.equal(1)
        expect(pageInfo.totalPages).to.be.a('number')
        expect(pageInfo.totalCustomers).to.be.a('number')
      })
    })

    it('returns paginated customers on page 2', () => {
      cy.request('GET', `${apiUrl}/customers?page=2&limit=5`).then(({ status, body }) => {
        const { customers, pageInfo } = body

        expect(status).to.equal(200)
        expect(customers).to.be.an('array')
        expect(pageInfo.currentPage).to.equal(2)
      })
    })

    it('filters customers by size: Small', () => {
      cy.request('GET', `${apiUrl}/customers?size=Small`).then(({ status, body }) => {
        const { customers } = body

        expect(status).to.equal(200)
        customers.forEach(({ size, employees }) => {
          expect(size).to.equal('Small')
          expect(employees).to.be.below(100)
        })
      })
    })

    it('filters customers by size: Medium', () => {
      cy.request('GET', `${apiUrl}/customers?size=Medium`).then(({ status, body }) => {
        const { customers } = body

        expect(status).to.equal(200)
        customers.forEach(({ size, employees }) => {
          expect(size).to.equal('Medium')
          expect(employees).to.be.at.least(100)
          expect(employees).to.be.below(1000)
        })
      })
    })

    it('filters customers by size: Enterprise', () => {
      cy.request('GET', `${apiUrl}/customers?size=Enterprise`).then(({ status, body }) => {
        const { customers } = body

        expect(status).to.equal(200)
        customers.forEach(({ size, employees }) => {
          expect(size).to.equal('Enterprise')
          expect(employees).to.be.at.least(1000)
          expect(employees).to.be.below(10000)
        })
      })
    })

    it('filters customers by size: Large Enterprise', () => {
      cy.request('GET', `${apiUrl}/customers?size=Large Enterprise`).then(({ status, body }) => {
        const { customers } = body

        expect(status).to.equal(200)
        customers.forEach(({ size, employees }) => {
          expect(size).to.equal('Large Enterprise')
          expect(employees).to.be.at.least(10000)
          expect(employees).to.be.below(50000)
        })
      })
    })

    it('filters customers by size: Very Large Enterprise', () => {
      cy.request('GET', `${apiUrl}/customers?size=Very Large Enterprise`).then(({ status, body }) => {
        const { customers } = body

        expect(status).to.equal(200)
        customers.forEach(({ size, employees }) => {
          expect(size).to.equal('Very Large Enterprise')
          expect(employees).to.be.at.least(50000)
        })
      })
    })

    const industries = ['Technology', 'Logistics', 'Retail', 'HR', 'Finance']
    industries.forEach((industry) => {
      it(`filters customers by industry: ${industry}`, () => {
        cy.request('GET', `${apiUrl}/customers?industry=${industry}`).then(({ status, body }) => {
          const { customers } = body

          expect(status).to.equal(200)
          customers.forEach(({ industry: customerIndustry }) => {
            expect(customerIndustry).to.equal(industry)
          })
        })
      })
    })

    it('filters customers by size and industry combined', () => {
      cy.request('GET', `${apiUrl}/customers?size=Medium&industry=Technology`).then(({ status, body }) => {
        const { customers } = body

        expect(status).to.equal(200)
        customers.forEach(({ size, industry, employees }) => {
          expect(size).to.equal('Medium')
          expect(industry).to.equal('Technology')
          expect(employees).to.be.at.least(100)
          expect(employees).to.be.below(1000)
        })
      })
    })

    it('returns customers array with valid structure', () => {
      cy.request('GET', `${apiUrl}/customers`).then(({ status, body }) => {
        const { customers } = body

        expect(status).to.equal(200)
        if (customers.length > 0) {
          const customer = customers[0]
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

    it('returns valid size values for all customers', () => {
      const validSizes = ['Small', 'Medium', 'Enterprise', 'Large Enterprise', 'Very Large Enterprise']

      cy.request('GET', `${apiUrl}/customers`).then(({ status, body }) => {
        const { customers } = body

        expect(status).to.equal(200)
        customers.forEach(({ size }) => {
          expect(validSizes).to.include(size)
        })
      })
    })

    it('returns valid industry values for all customers', () => {
      const validIndustries = ['Logistics', 'Retail', 'Technology', 'HR', 'Finance']

      cy.request('GET', `${apiUrl}/customers`).then(({ status, body }) => {
        const { customers } = body

        expect(status).to.equal(200)
        customers.forEach(({ industry }) => {
          expect(validIndustries).to.include(industry)
        })
      })
    })

    it('returns contactInfo as null or with name and email properties', () => {
      cy.request('GET', `${apiUrl}/customers`).then(({ status, body }) => {
        const { customers } = body

        expect(status).to.equal(200)
        customers.forEach(({ contactInfo }) => {
          if (contactInfo !== null) {
            expect(contactInfo).to.have.property('name')
            expect(contactInfo).to.have.property('email')
          }
        })
      })
    })

    it('returns address as null or with complete structure', () => {
      cy.request('GET', `${apiUrl}/customers`).then(({ status, body }) => {
        const { customers } = body

        expect(status).to.equal(200)
        customers.forEach(({ address }) => {
          if (address !== null) {
            expect(address).to.have.property('street')
            expect(address).to.have.property('city')
            expect(address).to.have.property('state')
            expect(address).to.have.property('zipCode')
            expect(address).to.have.property('country')
          }
        })
      })
    })

    it('respects the limit parameter', () => {
      cy.request('GET', `${apiUrl}/customers?limit=20`).then(({ status, body }) => {
        const { customers } = body

        expect(status).to.equal(200)
        expect(customers.length).to.be.at.most(20)
      })
    })

    it('navigates to the last page correctly', () => {
      cy.request('GET', `${apiUrl}/customers?page=1&limit=10`).then(({ status, body }) => {
        const { pageInfo: { totalPages } } = body

        expect(status).to.equal(200)
        expect(totalPages).to.be.greaterThan(0)

        cy.request('GET', `${apiUrl}/customers?page=${totalPages}&limit=10`).then(({ status: lastStatus, body: lastBody }) => {
          const { pageInfo: { currentPage } } = lastBody

          expect(lastStatus).to.equal(200)
          expect(currentPage).to.equal(totalPages)
        })
      })
    })
  })

  describe('Invalid requests', () => {
    it('returns 400 for negative page value', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/customers?page=-1`,
        failOnStatusCode: false
      }).then(({ status }) => {
        expect(status).to.equal(400)
      })
    })

    it('returns 400 for page value of zero', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/customers?page=0`,
        failOnStatusCode: false
      }).then(({ status }) => {
        expect(status).to.equal(400)
      })
    })

    it('returns 400 for non-numeric page value', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/customers?page=abc`,
        failOnStatusCode: false
      }).then(({ status }) => {
        expect(status).to.equal(400)
      })
    })

    it('returns 400 for negative limit value', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/customers?limit=-5`,
        failOnStatusCode: false
      }).then(({ status }) => {
        expect(status).to.equal(400)
      })
    })

    it('returns 400 for limit value of zero', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/customers?limit=0`,
        failOnStatusCode: false
      }).then(({ status }) => {
        expect(status).to.equal(400)
      })
    })

    it('returns 400 for non-numeric limit value', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/customers?limit=xyz`,
        failOnStatusCode: false
      }).then(({ status }) => {
        expect(status).to.equal(400)
      })
    })

    it('returns 400 for invalid size value', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/customers?size=InvalidSize`,
        failOnStatusCode: false
      }).then(({ status }) => {
        expect(status).to.equal(400)
      })
    })

    it('returns 400 for invalid industry value', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/customers?industry=InvalidIndustry`,
        failOnStatusCode: false
      }).then(({ status }) => {
        expect(status).to.equal(400)
      })
    })
  })
})
