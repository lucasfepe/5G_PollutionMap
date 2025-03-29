# 5G Pollution Map

This project visualizes pollution data using a combination of Node.js, Python, and the OpenAQ API.

## Getting Started

### Prerequisites
1. Install [Node.js](https://nodejs.org/) (version 16 or higher).
2. Install [Python](https://www.python.org/) (version 3.8 or higher).
3. Install `pip`, the Python package manager.
4. Clone the repository:
   ```bash
   git clone https://github.com/your-username/5G_PollutionMap.git
   cd 5G_PollutionMap
   ```

---

### Setting Up the Node.js Environment
1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory and add your OpenAQ API key:
   ```
   NEXT_PUBLIC_OPENAQ_API_KEY=your_api_key_here
   ```

3. Run the Node.js server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

### Setting Up the Python Environment
1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows:
     ```bash
     .\venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. Install Python dependencies:
   ```bash
   pip install -r python/requirements.txt
   ```



---

### Notes for Contributors
- If you add new Python dependencies, update the `requirements.txt` file:
  ```bash
  pip freeze > python/requirements.txt
  ```

- Ensure the `venv` folder is added to `.gitignore` to avoid committing it to the repository.

---

## Troubleshooting
- **ModuleNotFoundError for `openaq`**:
  Ensure you have installed the dependencies in the virtual environment by running:
  ```bash
  pip install -r python/requirements.txt
  ```

- **Missing API Key**:
  If the Python script fails due to missing API keys, double-check that the `NEXT_PUBLIC_OPENAQ_API_KEY` environment variable is set correctly.

- **Python Script Errors**:
  If the Python script fails with an error, check the `latest_measurements.json` file for any issues or inspect the error message printed to the console.

---

## Project Structure
- `apiDataFiles/`: Contains generated data files.
- `python/`: Contains Python scripts and dependencies.
- `src/`: Contains the main application code.
- `public/`: Contains static assets.
- `README.md`: Project documentation.

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

---

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## License
This project is licensed under the MIT License.