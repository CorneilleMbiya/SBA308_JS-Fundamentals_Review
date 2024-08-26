function getLearnerData(courseInfo, assignmentGroup, learnerSubmissions) {
    try {
        // Validate course_id
        if (assignmentGroup.course_id !== courseInfo.id) {
            throw new Error("Invalid AssignmentGroup: course_id does not match CourseInfo id.");
        }

        const results = [];
        let totalScore = 0;
        let totalPoints = 0;

        for (const submission of learnerSubmissions) {
            const assignment = assignmentGroup.assignments.find(a => a.id === submission.assignment_id);
            if (!assignment) {
                continue; // Skip if assignment not found
            }

            const dueDate = new Date(assignment.due_at);
            const submittedDate = new Date(submission.submission.submitted_at);

            // Check if assignment is due
            if (submittedDate > dueDate) {
                submission.submission.score *= 0.9; // Deduct 10% for late submission
            }

            // Validate points_possible
            if (typeof assignment.points_possible !== 'number' || assignment.points_possible <= 0) {
                throw new Error(`Invalid points_possible for assignment ${assignment.id}.`);
            }

            // Only include if assignment is due
            if (submittedDate <= dueDate) {
                const result = {
                    learner_id: submission.learner_id,
                    assignment_id: submission.assignment_id,
                    score: submission.submission.score,
                    points_possible: assignment.points_possible,
                    percentage: (submission.submission.score / assignment.points_possible) * 100
                };

                results.push(result);
                totalScore += submission.submission.score;
                totalPoints += assignment.points_possible;
            }
        }

        // Calculate average score
        const averageScore = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;

        return {
            results,
            averageScore
        };

    } catch (error) {
        console.error(error.message);
        return null; // Return null in case of error
    }
}


//Exemple with data:

const course = { id: 1, name: "Mathematics" };
const assignmentGroup = {
    id: 1,
    name: "Homework",
    group_weight: 20,
    assignments: [
        { id: 1, name: "Algebra", due_at: "2023-10-01T23:59:59Z", points_possible: 100 },
        { id: 2, name: "Geometry", due_at: "2023-10-05T23:59:59Z", points_possible: 0 }, // Invalid points
        { id: 3, name: "Calculus", due_at: "2023-10-10T23:59:59Z", points_possible: 50 }
    ],
    course_id: 1
};
 
const submissions = [
    { learner_id: 1, assignment_id: 1, submission: { submitted_at: "2023-09-30T12:00:00Z", score: 90 } },
    { learner_id: 1, assignment_id: 3, submission: { submitted_at: "2023-10-11T12:00:00Z", score: 40 } } // Late submission
];
 
try {
    const learnerData = getLearnerData(course, assignmentGroup, submissions);
    console.log(learnerData);
} catch (error) {
    console.error(error.message);
}