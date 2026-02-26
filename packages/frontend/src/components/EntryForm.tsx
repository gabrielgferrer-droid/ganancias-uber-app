import React, { useState } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';

interface EntryFormProps {
  onAddEntry: (type: 'income' | 'expense', amount: number, category?: string) => void;
}

const EntryForm: React.FC<EntryFormProps> = ({ onAddEntry }) => {
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');

  const expenseCategories = [
    'Combustible', 'Lavados', 'Peajes', 'Reparaciones', 'Repuestos', 'Comida', 'Otros'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor, introduce una cantidad válida.');
      return;
    }
    onAddEntry(type, parsedAmount, type === 'expense' ? category : undefined);
    setAmount('');
    setCategory('');
  };

  return (
    <Card className="mt-4">
      <Card.Header>Añadir Nuevo Registro</Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group as={Row} className="mb-3">
            <Form.Label as="legend" column sm={2}>
              Tipo
            </Form.Label>
            <Col sm={10}>
              <Form.Check
                type="radio"
                label="Ingreso"
                name="entryType"
                id="incomeRadio"
                value="income"
                checked={type === 'income'}
                onChange={() => setType('income')}
                inline
              />
              <Form.Check
                type="radio"
                label="Gasto"
                name="entryType"
                id="expenseRadio"
                value="expense"
                checked={type === 'expense'}
                onChange={() => setType('expense')}
                inline
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3" controlId="formAmount">
            <Form.Label column sm={2}>
              Cantidad
            </Form.Label>
            <Col sm={10}>
              <Form.Control
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </Col>
          </Form.Group>

          {type === 'expense' && (
            <Form.Group as={Row} className="mb-3" controlId="formCategory">
              <Form.Label column sm={2}>
                Categoría
              </Form.Label>
              <Col sm={10}>
                <Form.Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {expenseCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </Col>
            </Form.Group>
          )}

          <Button variant="primary" type="submit">
            Añadir
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default EntryForm;
