"use client";

import { useState, useMemo } from "react";
import { tools, categories } from "@/lib/tools";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Link as LinkIcon, Wrench } from "lucide-react";

export default function Home() {
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const allCategories = categories.map(category => ({
      ...category,
      tools: tools.filter(tool => tool.category === category.id)
    }));

    if (!search.trim()) {
      return allCategories;
    }

    const lowercasedSearch = search.toLowerCase();
    
    return allCategories.map(category => ({
      ...category,
      tools: category.tools.filter(tool => 
        tool.name.toLowerCase().includes(lowercasedSearch) ||
        tool.description.toLowerCase().includes(lowercasedSearch)
      )
    })).filter(category => category.tools.length > 0);

  }, [search]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 hidden md:flex items-center">
            <Wrench className="h-6 w-6 mr-2 text-primary" />
            <span className="text-xl font-bold">ToolsHub</span>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search for a tool..." 
                  className="pl-9 w-full" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search tools"
                />
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          {filteredCategories.length > 0 ? (
            <div className="space-y-12">
              {filteredCategories.map(category => (
                <section key={category.id}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <category.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{category.name}</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {category.tools.map(tool => (
                      <Card key={tool.name} className="flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 bg-card">
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold">{tool.name}</CardTitle>
                          <CardDescription className="pt-1 text-muted-foreground">{tool.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto flex">
                          <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                            <a href={tool.link} target="_blank" rel="noopener noreferrer">
                              Open Tool
                              <LinkIcon className="ml-2 h-4 w-4" />
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-2">No tools found</h2>
              <p className="text-lg text-muted-foreground">Your search for "{search}" did not match any tools.</p>
            </div>
          )}
        </div>
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by an expert AI engineer. Inspired by <a href="https://github.com/droidmarx/Ferramentas" target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-4 text-primary">Ferramentas</a>.
          </p>
        </div>
      </footer>
    </div>
  );
}
