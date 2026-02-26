import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

interface DashboardProps {
  dailyEarnings: number;
  dailyExpenses: number;
  dailyBalance: number;
}

const Dashboard: React.FC<DashboardProps> = ({ dailyEarnings, dailyExpenses, dailyBalance }) => {
  return (
    <div className="mt-4">
      <Row>
        <Col>
          <Card bg="success" text="white" className="mb-2">
            <Card.Header>Ganancias Diarias</Card.Header>
            <Card.Body>
              <Card.Title>${dailyEarnings.toFixed(2)}</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card bg="danger" text="white" className="mb-2">
            <Card.Header>Gastos Diarios</Card.Header>
            <Card.Body>
              <Card.Title>${dailyExpenses.toFixed(2)}</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card bg="info" text="white" className="mb-2">
            <Card.Header>Balance Diario</Card.Header>
            <Card.Body>
              <Card.Title>${dailyBalance.toFixed(2)}</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;