import Graph from '../components/graph';

import { Layout, Typography, Row, Col } from 'antd';
import { clients } from '../utils/mock';

const { Title } = Typography;
const { Content, Header } = Layout;
console.log(clients);
export default function Home() {
  return (
    <Layout>
      <Header style={{ textAlign: 'center' }}>
        <Title level={2} style={{ color: 'white', marginTop: '6px' }}>
          Monitoring Dashboard Simulation
        </Title>
      </Header>
      <Content style={{ padding: '50px 50px' }}>
        <Row>
          {clients.map((client) => {
            return (
              <Col key={client.circuitId} style={{ margin: '5px 5px' }}>
                <Graph client={client}></Graph>
              </Col>
            );
          })}
        </Row>
      </Content>
    </Layout>
  );
}
