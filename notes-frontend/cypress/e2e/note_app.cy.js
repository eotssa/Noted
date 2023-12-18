describe('Note app', function() {

  beforeEach(function() {
    cy.request('POST', `${Cypress.env('BACKEND')}/testing/reset`)
    const user = {
      name: 'Wilson',
      username: 'admin',
      password: 'admin'
    }
    cy.request('POST', `${Cypress.env('BACKEND')}/users/`, user)
    cy.visit('')  })

  it('front page can be opened', function() {
    cy.contains('Notes')
    cy.contains('Note app, eotssa')
  })

  it('login fails with wrong password', function() {
    cy.contains('log in').click()
    cy.get('#username').type('admin')
    cy.get('#password').type('wrong')
    cy.get('#login-button').click()

    cy.get('.error')
      .should('contain', 'Wrong credentials')
      .and('have.css', 'color', 'rgb(255, 0, 0)')
      .and('have.css', 'border-style', 'solid')

    cy.get('html').should('not.contain', 'admin logged in')
    //cy.contains('admin logged in').should('not.exist')
  })


  it('user can login', function () {
    cy.contains('log in').click()
    cy.get('#username').type('admin')
    cy.get('#password').type('admin')
    cy.get('#login-button').click()

    cy.contains('admin logged in')
  })

  describe('when logged in', function() {
    beforeEach(function() {
      cy.login({ username: 'admin', password: 'admin' })
      cy.createNote({ content: 'first note', important: false })
      cy.createNote({ content: 'second note', important: false })
      cy.createNote({ content: 'third note', important: false })
      cy.createNote({ content: 'another note cypress', important: true })
    })

    it('a new note can be created', function() {
      cy.contains('new note').click()
      cy.get('input').type('a note created by cypress') // TO DO: change 'input' to have a unique id CSS selector
      cy.contains('save').click()
      cy.contains('a note created by cypress')
    })

      it('one of those can be made important', function () {
        cy.contains('second note').parent().find('button').as('theButton')
        cy.get('@theButton').click()
        cy.get('@theButton').should('contain', 'make not important')
      })
    })
  })
