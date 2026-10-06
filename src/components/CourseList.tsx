export interface Course {
  id: string;
  title: string;
  platform: string;
  rating?: number;
  url: string;
}

const CourseList = ({ courses }: { courses: Course[] }) => {
  if (!courses.length) {
    return <p className="text-sm text-gray-500">No curated resources available yet.</p>;
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <a
          key={course.id}
          href={course.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white p-4 rounded-md shadow hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start gap-4">
            <div>
              <h4 className="font-medium text-gray-900">{course.title}</h4>
              <p className="text-sm text-gray-500 mt-1">{course.platform}</p>
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">Curated</span>
          </div>
        </a>
      ))}
    </div>
  );
};

export default CourseList;
