"use client";

import React, { useState } from "react";
import LoginForm from "~/components/auth/LoginForm";
import TeacherRegisterForm from "~/components/auth/TeacherRegisterForm";
import TeacherLoginForm from "~/components/auth/TeacherLoginForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const Page = () => {
  const [teacherAction, setTeacherAction] = useState<"login" | "register">(
    "login",
  );

  return (
    <div style={{ zIndex: 5 }}>
      <Tabs defaultValue="student" className="w-full">
        <TabsList className="mb-6 w-full">
          <TabsTrigger value="student" className="w-full">
            Student
          </TabsTrigger>
          <TabsTrigger value="teacher" className="w-full">
            Teacher
          </TabsTrigger>
        </TabsList>
        <TabsContent value="student">
          <LoginForm />
        </TabsContent>
        <TabsContent value="teacher">
          <div className="mb-4 flex justify-center">
            <Select
              value={teacherAction}
              onValueChange={(value: "login" | "register") =>
                setTeacherAction(value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="register">Register</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {teacherAction === "login" ? (
            <TeacherLoginForm />
          ) : (
            <TeacherRegisterForm />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;
