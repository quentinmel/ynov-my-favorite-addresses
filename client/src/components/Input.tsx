import styled from "styled-components";

export const Input = styled.input`
  flex: 1;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(31, 42, 46, 0.2);
  color: var(--text);
  background: #ffffff;
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover,
  &:active,
  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--ring);
    outline: none;
  }
`;
