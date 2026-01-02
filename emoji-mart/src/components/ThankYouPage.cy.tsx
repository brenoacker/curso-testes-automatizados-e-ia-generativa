import { ThankYouPage } from './ThankYouPage';

describe('ThankYouPage Component', () => {
  let mockOnBackToStore: ReturnType<typeof cy.stub>;
  const defaultOrderNumber = 'ORD-12345';

  beforeEach(() => {
    mockOnBackToStore = cy.stub().as('onBackToStore');
    
    cy.mount(
      <ThankYouPage 
        orderNumber={defaultOrderNumber} 
        onBackToStore={mockOnBackToStore} 
      />
    );
  });

  it('renders component correctly', () => {
    cy.contains('Thank You for Your Purchase!').should('be.visible');
    cy.contains('Your order has been successfully placed').should('be.visible');
  });

  it('displays order number correctly', () => {
    const orderNumber = 'ORD-98765';

    cy.mount(
      <ThankYouPage 
        orderNumber={orderNumber} 
        onBackToStore={mockOnBackToStore} 
      />
    );

    cy.get('.text-sm').contains('Order Number').should('be.visible');
    cy.get('.text-lg').contains(orderNumber).should('be.visible');
  });

  it('calls onBackToStore when Back to Store button is clicked', () => {
    cy.contains('button', 'Back to Store').should('be.visible').click();
    cy.get('@onBackToStore').should('have.been.calledOnce');
  });

  it('displays check mark icon', () => {
    // Verifica se o ícone está presente (lucide-react Check icon)
    cy.get('svg').should('be.visible');
  });

  it('has correct visual structure with CSS classes', () => {
    // Verifica se o container principal tem as classes corretas
    cy.get('div').should('have.class', 'min-h-screen');
    cy.contains('button', 'Back to Store').should('be.visible').and('have.class', 'bg-indigo-600');
  });

  it('has semantic HTML structure', () => {
    cy.get('h1').should('be.visible').and('contain', 'Thank You for Your Purchase!');
    cy.get('p').should('have.length.at.least', 2);
    cy.get('button').should('exist');
  });

  it('displays order number container with correct styling', () => {
    cy.get('.bg-gray-50').should('be.visible').and('contain', 'Order Number');
    cy.get('.bg-gray-50').should('be.visible').and('contain', defaultOrderNumber);
  });

  it('displays check mark icon container with correct styling', () => {
    cy.get('.bg-green-100').should('be.visible');
    cy.get('.bg-green-100').should('have.class', 'rounded-full');
    cy.get('.bg-green-100').within(() => {
      cy.get('svg').should('be.visible');
    });
  });

  it('displays main card with correct styling', () => {
    cy.get('.bg-white').should('be.visible');
    cy.get('.bg-white').should('have.class', 'shadow-lg');
    cy.get('.bg-white').should('have.class', 'rounded-lg');
  });

  it('calls onBackToStore multiple times when button is clicked repeatedly', () => {
    cy.contains('button', 'Back to Store').should('be.visible').click();
    cy.contains('button', 'Back to Store').should('be.visible').click();
    cy.contains('button', 'Back to Store').should('be.visible').click();
    cy.get('@onBackToStore').should('have.been.calledThrice');
  });

  it('displays order number with special characters', () => {
    const specialOrderNumber = 'ORD-123#ABC@456';
    
    cy.mount(
      <ThankYouPage 
        orderNumber={specialOrderNumber} 
        onBackToStore={mockOnBackToStore} 
      />
    );

    cy.get('.text-lg').contains(specialOrderNumber).should('be.visible');
  });

  it('displays order number with long text', () => {
    const longOrderNumber = 'ORD-' + 'A'.repeat(100);
    
    cy.mount(
      <ThankYouPage 
        orderNumber={longOrderNumber} 
        onBackToStore={mockOnBackToStore} 
      />
    );

    cy.get('.text-lg').contains(longOrderNumber).should('be.visible');
  });

  it('displays order number with empty string', () => {
    cy.mount(
      <ThankYouPage 
        orderNumber="" 
        onBackToStore={mockOnBackToStore} 
      />
    );

    cy.get('.text-lg').should('not.be.visible');
    cy.contains('Order Number').should('be.visible');
  });

  it('has accessible button with proper role', () => {
    cy.get('button').should('be.visible');
    cy.get('button').should('have.text', 'Back to Store');
  });

  it('has proper layout structure with flex classes', () => {
    cy.get('.min-h-screen').should('have.class', 'flex');
    cy.get('.min-h-screen').should('have.class', 'items-center');
    cy.get('.min-h-screen').should('have.class', 'justify-center');
  });

  it('displays all text content correctly', () => {
    cy.contains('Thank You for Your Purchase!').should('be.visible');
    cy.contains('Your order has been successfully placed').should('be.visible');
    cy.contains('We\'ve sent a confirmation email with your order details').should('be.visible');
    cy.contains('Order Number').should('be.visible');
    cy.contains('Back to Store').should('be.visible');
  });
});

