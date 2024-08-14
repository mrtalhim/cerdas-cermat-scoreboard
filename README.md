# Cerdas Cermat Scoreboard

A no-nonsense scoreboard app built with Vue.js and Tailwind CSS. This allows you to manage a scoreboard with multiple teams, like for quizzes (Cerdas Cermat).

## Features

- Add and Remove Teams: Users can add new teams or remove existing ones.
- Dynamic Score Updates: Change scores using predefined values or change it to any value, even negative!
- Optimized for large screen for shows with exciting animations!

## Installation

1. Clone the repository:

   `git clone https://github.com/your-username/scoreboard-app.git`

2. Navigate to the project directory:

   `cd scoreboard-app`

3. Install dependencies:

   `npm install`

4. Run the development server:

   `npm run serve`

5. Open your browser and navigate to `http://localhost:5173` to see the app in action.

## Usage

- Add Team: Click on the "Add Team" button to add a new team.
- Remove Team: Click the "X" button next to a team's name to remove it.
- Scoring: Use the score buttons to add or subtract points from a team's score. Scores are dynamically updated and visually highlighted.
- Setting: Click the "Setting" button to adjust global score values.

### Template

- Header Input: Displays a title input field.
- Buttons: Includes buttons for toggling the settings panel and adding teams.
- Collapsible Panel: Allows editing of global score values.
- Team Panel: Displays a list of teams with their scores. The team panel adjusts its layout based on the number of teams.

### Script

- Data: Manages the list of teams and global score values.
- Computed Properties: Dynamically adjusts the layout and score display based on the number of teams.
- Methods:
  - `addTeam()`: Adds a new team.
  - `removeTeam(index)`: Removes a team at a given index.
  - `changeScore(index, amount)`: Updates a team's score and applies visual feedback.
  - `togglePanel()`: Toggles the visibility of the settings panel.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to the branch (`git push origin feature/your-feature`).
6. Create a new Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Vue.js - The progressive JavaScript framework used in this project.
- Tailwind CSS - The utility-first CSS framework used for styling.