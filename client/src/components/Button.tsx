import styled from "styled-components";

export const Button = styled.button`
  flex: 1;
  border-radius: 10px;
  padding: 10px 14px;
  border: 0;
  box-shadow: none;
  background: linear-gradient(135deg, var(--primary), var(--primary-600));
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: transform 0.15s ease, opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;
