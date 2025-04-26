"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { ThemeSwitcher } from "../theme-switcher";
import { Leaf, Upload, Database, History, Home } from "lucide-react";

const NavigationBar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: <Home className="h-4 w-4 mr-2" /> },
    {
      name: "Diagnose",
      href: "/diagnosis",
      icon: <Upload className="h-4 w-4 mr-2" />,
    },
    {
      name: "Database",
      href: "/disease-database",
      icon: <Database className="h-4 w-4 mr-2" />,
    },
    {
      name: "History",
      href: "/history",
      icon: <History className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Leaf className="h-6 w-6" />
            <span className="font-bold">PlantDoctor</span>
          </Link>
        </div>
        <nav className="hidden md:flex flex-1 items-center justify-between">
          <div className="flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary flex items-center",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center">
            <ThemeSwitcher />
          </div>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2 md:hidden">
          <ThemeSwitcher />
        </div>
        <div className="flex md:hidden ml-2">
          <Button variant="outline" size="icon" className="rounded-full">
            <Leaf className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <nav className="md:hidden border-t bg-background">
        <div className="flex justify-between px-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col h-14 items-center justify-center px-4 text-xs",
                  pathname === item.href
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground",
                )}
              >
                {item.icon}
                <span className="mt-1">{item.name}</span>
              </Button>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export { NavigationBar };
