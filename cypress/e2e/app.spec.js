describe('ChessPlatform Full E2E (Authenticated)', () => {
    const username = 'BorisCool1';
    const password = 'pass123';

    // UI login helper (restored original flow)
    function uiLogin() {
        cy.visit('/');
        cy.contains('Log In').click();
        cy.get('input#username').type(username);
        cy.get('input#password').type(password);
        cy.get('button[type="submit"]').contains('Login').click();
        cy.url({ timeout: 10000 }).should('not.include', '/login');
        cy.get('nav').contains(username).should('be.visible');
    }

    // Ensure every test starts with a fresh login
    beforeEach(() => {
        uiLogin();
    });

    it('1. Logs in with real credentials', () => {
        // Already logged in by beforeEach
        cy.contains(username).should('be.visible');
    });

    it('2. Opens user page (dashboard) after login', () => {
        // Dashboard is at '/'
        cy.visit('/');
        cy.contains(username).should('be.visible');
    });

    it('3. Opens Articles tab and tests lazy loading', () => {
        // Three pages of 5 articles each (stubbed data)
        const page1 = Array.from({ length: 5 }, (_, i) => ({
            id: i + 1,
            articleTitle: `Article ${i + 1}`,
            contentText: `Content ${i + 1}`,
            imageUrl: ''
        }));
        const page2 = Array.from({ length: 5 }, (_, i) => ({
            id: 6 + i,
            articleTitle: `Article ${6 + i}`,
            contentText: `Content ${6 + i}`,
            imageUrl: ''
        }));
        const page3 = Array.from({ length: 5 }, (_, i) => ({
            id: 11 + i,
            articleTitle: `Article ${11 + i}`,
            contentText: `Content ${11 + i}`,
            imageUrl: ''
        }));

        // Intercept article pages explicitly
        cy.intercept('GET', '**/articles?page=0*', { statusCode: 200, body: { articles: page1 } }).as('getPage1');
        cy.intercept('GET', '**/articles?page=1*', { statusCode: 200, body: { articles: page2 } }).as('getPage2');
        cy.intercept('GET', '**/articles?page=2*', { statusCode: 200, body: { articles: page3 } }).as('getPage3');

        cy.get('.nav-link').contains('Articles').click();

        // Wait explicitly for initial pages
        cy.wait('@getPage1');
        cy.wait('@getPage2');

        // Initially 10 articles should be loaded
        cy.get('.card', { timeout: 10000 }).should('have.length', 10);

        // Trigger lazy-loading for page 3
        cy.get('.card').last().scrollIntoView();
        cy.wait('@getPage3');

        // Verify 15 articles after loading page 3
        cy.get('.card').should('have.length', 15);
    });

    it('4. Opens News tab and tests lazy loading', () => {
        // Official news fixtures (3 items)
        const officialNews = Array.from({ length: 3 }, (_, i) => ({
            id: i + 1,
            title: `News ${i + 1}`,
            link: `/news/${i + 1}`,
            description: `Desc ${i + 1}`,
            author: 'Admin',
            publishedDate: new Date().toISOString()
        }));

        // Stub the official news endpoint
        cy.intercept('GET', '**/news?page=*', {
            statusCode: 200,
            body: { content: officialNews }
        }).as('getNews');

        cy.get('.nav-link').contains('Official News').click();

        // Wait explicitly for initial load
        cy.wait('@getNews');

        // Verify initial load of news cards
        cy.get('.card', { timeout: 10000 }).should('have.length.at.least', officialNews.length);

        // Trigger lazy-loading by scrolling
        cy.get('.card').last().scrollIntoView();

        // Asserting again to confirm no errors in loading additional news (assuming infinite scroll logic)
        cy.get('.card').should('have.length.at.least', officialNews.length);
    });

    it('5. Opens Spectate tab', () => {
        cy.get('.nav-link').contains('Spectate').click();
        cy.url().should('include', '/spectate');
    });

    it('6. Opens Create Article (Post) from sidebar', () => {
        cy.get('.list-group-item').contains('Post').should('be.visible').click();
        cy.url().should('include', '/post');
    });

    it('7. Opens Start Stream after login', () => {
        cy.get('.list-group-item').contains('Start Stream').should('be.visible').click();
        cy.url().should('include', '/start-stream');
    });

    it('8. Checks Edit Users button in sidebar', () => {
        cy.get('.list-group-item').contains('Edit Users').should('be.visible');
    });

    it('9. Checks Create News button in sidebar', () => {
        cy.get('.list-group-item').contains('Create News').should('be.visible');
    });

    it('10. Opens Create News from sidebar', () => {
        cy.get('.list-group-item').contains('Create News').should('be.visible').click();
        cy.url().should('include', '/createnews');
    });
});

describe('Access Control Tests (Unauthenticated)', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('11. Dashboard should not show user content without login', () => {
        cy.visit('/');
        cy.contains('Log In').should('be.visible');
        cy.contains('BorisCool1').should('not.exist');
    });

    it('12. Articles should not load without login', () => {
        cy.visit('/articles');
        cy.get('.card').should('not.exist');
        cy.contains('Log In').should('be.visible');
    });

    it('13. News should not load without login', () => {
        cy.visit('/news');
        cy.get('.card').should('not.exist');
        cy.contains('Log In').should('be.visible');
    });

    it('14. Spectate tab should not load without login', () => {
        cy.visit('/spectate');
        cy.get('.card').should('not.exist');
        cy.contains('Log In').should('be.visible');
    });

    it('15. Post page should not load without login', () => {
        cy.visit('/post');
        cy.contains('Post Article').should('not.exist');
        cy.contains('Log In').should('be.visible');
    });

    it('16. Start Stream page should not load without login', () => {
        cy.visit('/start-stream');
        cy.contains('Start Your Stream').should('not.exist');
        cy.contains('Log In').should('be.visible');
    });

    it('17. Edit Users button should not appear without login', () => {
        cy.visit('/');
        cy.get('.list-group-item').contains('Edit Users').should('not.exist');
    });

    it('18. Create News button should not appear without login', () => {
        cy.visit('/');
        cy.get('.list-group-item').contains('Create News').should('not.exist');
    });
});