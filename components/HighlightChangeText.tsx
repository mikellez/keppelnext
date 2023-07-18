import React, { useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";

export default function HighlightChangedText(
  oldValue: string,
  newValue: string
) {
  // Find the part to be highlighted
  const highlightStartIndex = 0;
  const highlightEndIndex = 3;
  const prefix = newValue.substring(0, highlightStartIndex);
  const highlightedText = newValue.substring(
    highlightStartIndex,
    highlightEndIndex
  );
  const suffix = newValue.substring(highlightEndIndex);

  // Construct the highlighted value
  const highlightedValue = (
    <React.Fragment>
      {prefix}
      <span className="highlighted-text">{highlightedText}</span>
      {suffix}
    </React.Fragment>
  );

  return highlightedValue;
}
