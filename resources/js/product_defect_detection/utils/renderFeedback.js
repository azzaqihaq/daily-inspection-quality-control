import labels from "@trained_label/product_defect_web_model.json";

// Function renderFeedback to render the result to canvas
export const renderFeedback = (canvasRef, boxesData, scoresData, classesData, ratios) => {
  const ctx = canvasRef.getContext("2d");
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear canvas

  const colors = new generateBoxColor();

  // Font configuration
  const font = `${Math.max(
    Math.round(Math.max(ctx.canvas.width, ctx.canvas.height) / 40),
    14
  )}px Arial`;
  ctx.font = font;
  ctx.textBaseline = "top";

  for (let i = 0; i < scoresData.length; ++i) {
    if ((scoresData[i] * 100) < 70) {
      continue; // Skip rendering if score is below 50%
    }  

    // filter based on class threshold
    const klass = labels[classesData[i]];
    const color = colors.get(classesData[i]);
    const score = (scoresData[i] * 100).toFixed(1);

    let [y1, x1, y2, x2] = boxesData.slice(i * 4, (i + 1) * 4);
    x1 *= ratios[0];
    x2 *= ratios[0];
    y1 *= ratios[1];
    y2 *= ratios[1];
    const width = x2 - x1;
    const height = y2 - y1;

    // Draw filled box with transparency
    ctx.fillStyle = generateBoxColor.hexToRgba(color, 0.2);
    ctx.fillRect(x1, y1, width, height);

    // Draw border box
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(Math.min(ctx.canvas.width, ctx.canvas.height) / 200, 2.5);
    ctx.strokeRect(x1, y1, width, height);

    // Draw label background
    ctx.fillStyle = color;
    const textWidth = ctx.measureText(klass + " - " + score + "%").width;
    const textHeight = parseInt(font, 10); // base 10
    const yText = y1 - (textHeight + ctx.lineWidth);
    ctx.fillRect(
      x1 - 1,
      yText < 0 ? 0 : yText, // handle overflow label box
      textWidth + ctx.lineWidth,
      textHeight + ctx.lineWidth
    );

    // Draw labels
    ctx.fillStyle = "#ffffff";
    ctx.fillText(klass + " - " + score + "%", x1 - 1, yText < 0 ? 0 : yText);
  }
};

class generateBoxColor {
  constructor() {
    this.palette = [
      "#fc0000", "#07ca53", "#ff6900", "#f5f000"
    ];
    this.paletteSize = this.palette.length;
  }

  get = (index) => this.palette[Math.floor(index) % this.paletteSize];

  static hexToRgba = (hex, alpha) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `rgba(${[parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)].join(
          ", "
        )}, ${alpha})`
      : null;
  };
}
