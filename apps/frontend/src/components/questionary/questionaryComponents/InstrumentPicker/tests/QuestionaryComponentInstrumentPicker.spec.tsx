/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Answer, InstrumentPickerConfig } from 'generated/sdk';

import {
  processInstrumentPickerValue,
  QuestionaryComponentInstrumentPicker,
} from '../QuestionaryComponentInstrumentPicker';

// minimal fullConfig used across tests
const fullConfig = {
  instruments: [
    { id: 1, name: 'Inst A' },
    { id: 2, name: 'Inst B' },
  ],
  isMultipleSelect: false,
  readPermissions: [],
  requestTime: false,
  required: false,
  small_label: '',
  tooltip: '',
  variant: 'dropdown',
} as unknown as InstrumentPickerConfig;

describe('processInstrumentPickerValue', () => {
  it('filters array values to known instruments', () => {
    const answer = {
      answerId: 1,
      value: [{ instrumentId: '1' }, { instrumentId: '3' }],
      config: fullConfig,
      dependencies: [],
      dependenciesOperator: null,
      sortOrder: 0,
      topicId: 0,
    } as unknown as Answer;

    const res = processInstrumentPickerValue(answer, fullConfig);

    expect(Array.isArray(res)).toBe(true);
    expect(res).toEqual([{ instrumentId: '1' }]);
  });

  it('returns single value when existing', () => {
    const answer = {
      answerId: 2,
      value: { instrumentId: '2' },
      config: fullConfig,
      dependencies: [],
      dependenciesOperator: null,
      sortOrder: 0,
      topicId: 0,
    } as unknown as Answer;

    const res = processInstrumentPickerValue(answer, fullConfig);

    expect(res).toEqual({ instrumentId: '2' });
  });

  it('returns null when single value unknown', () => {
    const answer = {
      answerId: 3,
      value: { instrumentId: '5' },
      config: fullConfig,
      dependencies: [],
      dependenciesOperator: null,
      sortOrder: 0,
      topicId: 0,
    } as unknown as Answer;

    const res = processInstrumentPickerValue(answer, fullConfig);

    expect(res).toBeNull();
  });
});

// Helper to build a minimal Answer mock with the required fields
const buildAnswer = (overrides: Partial<Answer> = {}) =>
  ({
    question: {
      id: 'q1',
      question: 'Pick',
      naturalKey: 'nk',
      categoryId: null,
      config: null,
      dataType: null,
    },
    value: null,
    config: fullConfig,
    answerId: 0,
    dependencies: [],
    dependenciesOperator: null,
    sortOrder: 0,
    topicId: 0,
    ...overrides,
  }) as unknown as Answer;

describe('QuestionaryComponentInstrumentPicker component', () => {
  it('renders radio variant and reflects selection via props', async () => {
    const onComplete = jest.fn();
    const answer = buildAnswer({
      value: { instrumentId: null },
      config: {
        variant: 'radio',
        required: false,
        instruments: [
          { id: 10, name: 'X' },
          { id: 11, name: 'Y' },
        ],
        readPermissions: [],
        isMultipleSelect: false,
        requestTime: false,
        small_label: '',
        tooltip: '',
      } as unknown as InstrumentPickerConfig,
    });

    const { rerender, container } = render(
      <QuestionaryComponentInstrumentPicker
        answer={answer}
        onComplete={onComplete}
        formikProps={{ errors: {}, touched: {} } as any}
      />
    );

    // radios present
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radios.length).toBeGreaterThan(0);

    // Now simulate parent updating the answer prop after selection by rerendering with a selected value
    const updated = buildAnswer({
      value: { instrumentId: '10', timeRequested: '0' },
      config: answer.config,
    });

    rerender(
      <QuestionaryComponentInstrumentPicker
        answer={updated}
        onComplete={onComplete}
        formikProps={{ errors: {}, touched: {} } as any}
      />
    );

    // Now an input with value '10' should exist (the selected radio)
    const inputWithValue10 = container.querySelector('input[value="10"]');
    expect(inputWithValue10).toBeTruthy();
  });

  it('renders dropdown multiple variant and reflects time input via props', async () => {
    const onComplete = jest.fn();
    const answer = buildAnswer({
      value: [],
      config: {
        variant: 'dropdown',
        isMultipleSelect: true,
        requestTime: true,
        required: false,
        instruments: [
          { id: 1, name: 'Inst A' },
          { id: 2, name: 'Inst B' },
        ],
        readPermissions: [],
        small_label: '',
        tooltip: '',
      } as unknown as InstrumentPickerConfig,
    });

    const { rerender } = render(
      <QuestionaryComponentInstrumentPicker
        answer={answer}
        onComplete={onComplete}
        formikProps={{ errors: {}, touched: {} } as any}
      />
    );

    // Rerender with selected answer (parent updated after selection)
    const selectedAnswer = buildAnswer({
      value: [{ instrumentId: '1', timeRequested: '0' }],
      config: answer.config,
    });

    rerender(
      <QuestionaryComponentInstrumentPicker
        answer={selectedAnswer}
        onComplete={onComplete}
        formikProps={{ errors: {}, touched: {} } as any}
      />
    );

    // Now simulate parent updating timeRequested to '5' and rerender
    const selectedAnswerWithTime = buildAnswer({
      value: [{ instrumentId: '1', timeRequested: '5' }],
      config: answer.config,
    });

    rerender(
      <QuestionaryComponentInstrumentPicker
        answer={selectedAnswerWithTime}
        onComplete={onComplete}
        formikProps={{ errors: {}, touched: {} } as any}
      />
    );

    // Assert that an input with display value '5' is present
    expect(screen.getByDisplayValue('5')).toBeTruthy();
  });
});
