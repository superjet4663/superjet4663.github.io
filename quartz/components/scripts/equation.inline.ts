import { LCG } from "../../util/helpers"

const equations = [
  {
    name: "Cross Entropy Loss",
    latex: "\\mathcal{L} = -\\sum_{i=1}^{n} y_i \\log(\\hat{y}_i)",
    asciimath: "L = -sum_(i=1)^n y_i log(hat y_i)",
    description: "Measures dissimilarity between predicted probabilities and true labels",
  },
  {
    name: "Gradient Descent",
    latex: "w_{t+1} = w_t - \\alpha \\nabla_{w_t} \\mathcal{L}(w_t)",
    asciimath: "w_(t+1) = w_t - alpha nabla_(w_t) L(w_t)",
    description: "Updates parameters in direction that minimizes loss",
  },
  {
    name: "Backpropagation",
    latex:
      "\\frac{\\partial \\mathcal{L}}{\\partial w} = \\frac{\\partial \\mathcal{L}}{\\partial a} \\frac{\\partial a}{\\partial z} \\frac{\\partial z}{\\partial w}",
    asciimath: "((del L)/(del w)) = ((del L)/(del a))((del a)/(del z))((del z)/(del w))",
    description: "Chain rule application in neural network backpropagation",
  },
  {
    name: "Softmax",
    latex: "\\sigma(\\mathbf{z})_i = \\frac{e^{z_i}}{\\sum_{j=1}^K e^{z_j}}",
    asciimath: "sigma(bb{z})_i = (e^(z_i))/(sum_(j=1)^K e^(z_j))",
    description: "Converts logits to probabilities that sum to 1",
  },
  {
    name: "ReLU",
    latex: "f(x) = \\max(0, x)",
    asciimath: "f(x) = max(0, x)",
    description: "Rectified Linear Unit activation function",
  },
  {
    name: "LSTM Cell",
    latex:
      "\\begin{aligned} f_t &= \\sigma(W_f \\cdot [h_{t-1}, x_t] + b_f) \\\\ i_t &= \\sigma(W_i \\cdot [h_{t-1}, x_t] + b_i) \\\\ \\tilde{C}_t &= \\tanh(W_C \\cdot [h_{t-1}, x_t] + b_C) \\\\ C_t &= f_t \\times C_{t-1} + i_t \\times \\tilde{C}_t \\end{aligned}",
    asciimath: `
      f_t = sigma(W_f * [h_(t-1), x_t] + b_f)
      i_t = sigma(W_i * [h_(t-1), x_t] + b_i)
      tilde C_t = tanh(W_C * [h_(t-1), x_t] + b_C)
      C_t = f_t times C_(t-1) + i_t times tilde C_t`,
    description: "Long Short-Term Memory cell computations",
  },
  {
    name: "Batch Normalization",
    latex: "\\hat{x}^{(k)} = \\frac{x^{(k)} - E[x^{(k)}]}{\\sqrt{Var[x^{(k)}] + \\epsilon}}",
    asciimath: "hat x^((k)) = (x^((k)) - E[x^((k))])/(sqrt(Var[x^((k))] + epsilon))",
    description: "Normalizes layer inputs for faster training",
  },
  {
    name: "Self-Attention",
    latex: "\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V",
    asciimath: "text(Attention)(Q,K,V) = text(softmax)((QK^T)/(sqrt(d_k)))V",
    description: "Scaled dot-product attention mechanism",
  },
  {
    name: "Adam Optimizer",
    latex:
      "\\begin{aligned} m_t &= \\beta_1 m_{t-1} + (1-\\beta_1) g_t \\\\ v_t &= \\beta_2 v_{t-1} + (1-\\beta_2) g_t^2 \\\\ \\hat{m}_t &= \\frac{m_t}{1-\\beta_1^t} \\\\ \\hat{v}_t &= \\frac{v_t}{1-\\beta_2^t} \\\\ w_{t+1} &= w_t - \\frac{\\eta}{\\sqrt{\\hat{v}_t} + \\epsilon} \\hat{m}_t \\end{aligned}",
    asciimath: `
      m_t = beta_1 m_(t-1) + (1-beta_1)g_t
      v_t = beta_2 v_(t-1) + (1-beta_2)g_t^2
      hat m_t = m_t/(1-beta_1^t)
      hat v_t = v_t/(1-beta_2^t)
      w_(t+1) = w_t - (eta)/(sqrt(hat v_t) + epsilon) hat m_t`,
    description: "Adam optimizer parameter updates",
  },
  {
    name: "Dropout",
    latex:
      "\\text{dropout}(x) = \\begin{cases} \\frac{x}{1-p} & \\text{with probability } 1-p \\\\ 0 & \\text{with probability } p \\end{cases}",
    asciimath: `text(dropout)(x) = cases(
      (x)/(1-p) with"probability"1-p,
      0 with"probability"p
    )`,
    description: "Dropout regularization during training",
  },
  {
    name: "JumpReLU",
    latex:
      "\\text{JReLU}(x) = \\begin{cases} x + \\alpha & \\text{if } x > 0 \\\\ 0 & \\text{otherwise} \\end{cases}",
    asciimath: "text(JReLU)(x) = cases(x + alpha if x > 0, 0 otherwise)",
    description: "Jump ReLU adds a positive jump of α to standard ReLU activation",
  },
  {
    name: "Nesterov Momentum",
    latex:
      "\\begin{aligned} v_{t+1} &= \\mu v_t - \\epsilon \\nabla f(\\theta_t + \\mu v_t) \\\\ \\theta_{t+1} &= \\theta_t + v_{t+1} \\end{aligned}",
    asciimath: `v_(t+1) = mu v_t - epsilon nabla f(theta_t + mu v_t)
theta_(t+1) = theta_t + v_(t+1)`,
    description:
      "Nesterov momentum looks ahead by calculating gradients at the predicted next position",
  },
  {
    name: "Swish Activation",
    latex: "\\text{Swish}(x) = x \\cdot \\sigma(\\beta x) = \\frac{x}{1 + e^{-\\beta x}}",
    asciimath: "text(Swish)(x) = x * sigma(beta x) = (x)/(1 + e^(-beta x))",
    description:
      "Self-gated activation function that varies between linear and ReLU-like behavior based on β",
  },
]

function getEquationOfDay(): {
  name: string
  latex: string
  asciimath: string
  description: string
} {
  // Use current date as seed to get same equation for whole day
  const now = new Date()
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const rng = new LCG(seed)

  return rng.choice(equations)
}

function createBox(text: string | undefined | null, width: number = 80): string {
  // Handle null/undefined input
  if (!text) {
    text = ""
  }

  // Convert to string and normalize whitespace
  const textStr = String(text).replace(/\r\n/g, "\n")

  // Split into lines and clean them up
  const lines = textStr.split("\n").map((line) => line.replace(/^\s+/, "")) // Only trim leading whitespace

  // Handle empty input
  if (lines.length === 0) {
    lines.push("") // Add empty line for empty box
  }

  // Calculate actual width needed
  const maxLineLength = Math.min(width, Math.max(...lines.map((line) => line.length)))
  const boxWidth = Math.max(maxLineLength, 20) // Minimum width of 20

  // Create box elements
  const horizontalLine = "-".repeat(boxWidth + 4) // +4 for consistent side margins
  const top = `-${horizontalLine}+`
  const bottom = `+${horizontalLine}+`

  // Create padded lines with consistent margins
  const paddedLines = lines.map((line) => {
    const padding = " ".repeat(boxWidth - line.length + 2) // +2 to match right margin
    return `|  ${line}${padding}|` // Two spaces after | for consistent left margin
  })

  return [top, ...paddedLines, bottom].join("\n")
}

// Create a styled console output
function logEquation(equation: {
  name: string
  latex: string
  asciimath: string
  description: string
}): void {
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Common styles for console output
  const styles = {
    title: "font-size: 14px; font-weight: bold; color: #059669;",
    name: "font-size: 12px; font-weight: bold; color: #6366f1;",
    equation: "font-family: monospace; color: #2563eb;",
    description: "color: #4b5563; font-style: italic;",
    latex: "font-family: monospace; color: #2563eb;",
  }

  // Log the formatted output
  console.log(
    `\n%c🧮 Equation of the Day - ${dateStr}\n\n` +
      `%c${equation.name}\n\n` +
      `%c${createBox(equation.asciimath)}\n\n` +
      `%c${equation.description}\n\n` +
      `%cLatex: ${equation.latex}\n`,
    styles.title,
    styles.name,
    styles.equation,
    styles.description,
    styles.latex,
  )
}

let hasShownEquation = false

document.addEventListener("nav", () => {
  if (!hasShownEquation) {
    const eqOfDay = getEquationOfDay()
    logEquation(eqOfDay)
    hasShownEquation = true
  }
})
