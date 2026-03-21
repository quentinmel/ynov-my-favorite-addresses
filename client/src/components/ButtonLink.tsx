import styled from "styled-components";
import { Link } from "react-router";

export const ButtonLink = styled(Link)`
  display: block;
  flex: 1;
  border-radius: 10px;
  padding: 10px 14px;
  border: 0;
  box-shadow: none;
  background: linear-gradient(135deg, var(--primary), var(--primary-600));
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: transform 0.15s ease, opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;
