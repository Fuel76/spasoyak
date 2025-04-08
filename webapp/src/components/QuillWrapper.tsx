import React, { forwardRef } from 'react';
import ReactQuill, { ReactQuillProps } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const QuillWrapper = forwardRef<ReactQuill, ReactQuillProps>((props, ref) => (
  <ReactQuill ref={ref} {...props} />
));

export default QuillWrapper;