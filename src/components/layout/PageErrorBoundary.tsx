import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, Button, Typography } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class PageErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('PageErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <Alert
          type="error"
          showIcon
          message="Something went wrong"
          description={
            <>
              <Typography.Paragraph style={{ marginBottom: 8 }}>
                <Typography.Text code>{this.state.error.message}</Typography.Text>
              </Typography.Paragraph>
              <Button type="primary" onClick={() => this.setState({ error: null })}>
                Try again
              </Button>
            </>
          }
        />
      );
    }
    return this.props.children;
  }
}
