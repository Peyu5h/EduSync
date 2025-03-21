"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Loader2 } from "lucide-react";

interface WrongAnswer {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  materialName: string;
  courseName?: string;
  courseId?: string;
  timestamp: string;
}

interface Course {
  id: string;
  name: string;
  googleClassroomId: string;
  professorName?: string;
  professorProfilePicture?: string;
}

interface Class {
  id: string;
  name: string;
  classNumber: string;
  courses?: Course[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  classId?: string;
  class?: Class;
  courses?: Course[];
  taughtClasses?: Class[];
  wrongAnswers?: WrongAnswer[];
}

export default function UserProfilePage() {
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  const currentUser = useSelector((state: any) => state.user.user);
  const isCurrentUser = currentUser?.id === userId;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${userId}`,
        );

        console.log("User data response:", response.data);
        if (response.data.success) {
          setUser(response.data.data);

          if (
            response.data.data.wrongAnswers &&
            response.data.data.wrongAnswers.length > 0
          ) {
            setWrongAnswers(response.data.data.wrongAnswers);
          }
          // Otherwise fetch separately if needed
          else if (
            isCurrentUser ||
            currentUser?.role === "CLASS_TEACHER" ||
            currentUser?.role === "ADMIN"
          ) {
            try {
              const analyticsResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analytics/wrong-answers/${userId}`,
              );

              if (analyticsResponse.data.success) {
                setWrongAnswers(analyticsResponse.data.data);
              }
            } catch (analyticsError) {
              console.error("Error fetching analytics data:", analyticsError);
            }
          }
        } else {
          setError(response.data.message || "Failed to fetch user");
        }
      } catch (err) {
        setError("An error occurred while fetching user data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, isCurrentUser, currentUser?.role]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-destructive">Error</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">User not found</h2>
        <p className="text-muted-foreground">
          The requested user could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Tabs
        defaultValue="profile"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          {(isCurrentUser ||
            currentUser?.role === "CLASS_TEACHER" ||
            currentUser?.role === "ADMIN") && (
            <TabsTrigger value="analytics">Learning Analytics</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>
                Personal details and account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 pb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                  />
                  <AvatarFallback>
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <Badge className="mt-2">{user.role.replace("_", " ")}</Badge>
                </div>
              </div>

              <div className="space-y-4">
                {user.class && (
                  <div>
                    <h4 className="font-medium text-muted-foreground">Class</h4>
                    <p className="font-semibold">
                      {user.class.name} ({user.class.classNumber})
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {user.courses && user.courses.length > 0 ? (
              user.courses.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  {course.professorProfilePicture && (
                    <div className="h-40 w-full overflow-hidden">
                      <img
                        src={course.professorProfilePicture}
                        alt={course.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{course.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Professor
                        </p>
                        <p>{course.professorName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Google Classroom ID
                        </p>
                        <p className="truncate">{course.googleClassroomId}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">
                No courses available.
              </p>
            )}
          </div>
        </TabsContent>

        {(isCurrentUser ||
          currentUser?.role === "CLASS_TEACHER" ||
          currentUser?.role === "ADMIN") && (
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Learning Analytics</CardTitle>
                <CardDescription>
                  Track learning progress and areas for improvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {wrongAnswers.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <h3 className="text-lg font-medium">No data available</h3>
                    <p className="text-muted-foreground">
                      No wrong answers have been recorded yet. Complete quizzes
                      to see your learning analytics.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">
                      Recent Wrong Answers
                    </h3>
                    <div className="space-y-4">
                      {wrongAnswers.map((answer) => (
                        <div key={answer.id} className="rounded-lg border p-4">
                          <div className="flex justify-between">
                            <h4 className="font-semibold">
                              {answer.materialName}
                            </h4>
                            <span className="text-sm text-muted-foreground">
                              {new Date(answer.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-2 font-medium">
                            Question: {answer.question}
                          </p>
                          <div className="mt-2 grid gap-2 md:grid-cols-2">
                            <div className="rounded-md bg-destructive/10 p-2">
                              <p className="text-sm font-medium text-destructive">
                                Your answer: {answer.userAnswer}
                              </p>
                            </div>
                            <div className="rounded-md bg-primary/10 p-2">
                              <p className="text-sm font-medium text-primary">
                                Correct answer: {answer.correctAnswer}
                              </p>
                            </div>
                          </div>
                          {answer.courseName && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              Course: {answer.courseName}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
