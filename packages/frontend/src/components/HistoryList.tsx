import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';

interface Entry {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category?: string;
  date: string;
}

interface HistoryListProps {
  entries: Entry[];
}

const HistoryList: React.FC<HistoryListProps> = ({ entries }) => {
  return (
    <Card className="mt-4">
      <Card.Header>Historial de Registros</Card.Header>
      <ListGroup variant="flush">
        {entries.length === 0 ? (
          <ListGroup.Item>No hay registros aún.</ListGroup.Item>
        ) : (
          entries.map((entry) => (
            <ListGroup.Item key={entry.id} className="d-flex justify-content-between align-items-center">
              <div>
                {entry.type === 'income' ? 'Ingreso' : 'Gasto'}
                {entry.category && <Badge bg="secondary" className="ms-2">{entry.category}</Badge>}
                <br />
                <small className="text-muted">{new Date(entry.date).toLocaleString()}</small>
              </div>
              <Badge bg={entry.type === 'income' ? 'success' : 'danger'}>
                ${entry.amount.toFixed(2)}
              </Badge>
            </ListGroup.Item>
          ))
        )}
      </ListGroup>
    </Card>
  );
};

export default HistoryList;
