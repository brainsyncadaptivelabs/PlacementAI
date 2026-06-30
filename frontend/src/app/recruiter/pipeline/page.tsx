"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MoreHorizontal } from "lucide-react";

// Kanban Columns
const initialColumns = {
  applied: { id: "applied", title: "Applied", candidateIds: ["c1"] },
  ats_passed: { id: "ats_passed", title: "ATS Passed", candidateIds: ["c2"] },
  interview: { id: "interview", title: "Technical Interview", candidateIds: ["c3", "c4"] },
  hr: { id: "hr", title: "HR Round", candidateIds: [] },
  offer: { id: "offer", title: "Offer Extended", candidateIds: [] },
};

// Candidates Data
const initialCandidates = {
  c1: { id: "c1", name: "Rajat Gupta", college: "IIT Madras", score: 85, band: "Gold" },
  c2: { id: "c2", name: "Sneha Reddy", college: "NIT Warangal", score: 92, band: "Platinum" },
  c3: { id: "c3", name: "Aryan Sharma", college: "IIT Bombay", score: 96, band: "Platinum" },
  c4: { id: "c4", name: "Kunal Jain", college: "BITS Pilani", score: 88, band: "Gold" },
};

export default function HiringPipeline() {
  const [columns, setColumns] = useState<any>(initialColumns);
  const [candidates, setCandidates] = useState<any>(initialCandidates);

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];

    const newSourceCandidateIds = Array.from(sourceCol.candidateIds);
    newSourceCandidateIds.splice(source.index, 1);

    const newDestCandidateIds = Array.from(destCol.candidateIds);
    newDestCandidateIds.splice(destination.index, 0, draggableId);

    setColumns({
      ...columns,
      [source.droppableId]: { ...sourceCol, candidateIds: newSourceCandidateIds },
      [destination.droppableId]: { ...destCol, candidateIds: newDestCandidateIds },
    });
  };

  return (
    <div className="p-8 h-[calc(100vh-64px)] flex flex-col font-sans">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-foreground tracking-tight font-heading">
          Hiring Pipeline
        </h1>
        <p className="text-muted-foreground font-medium">Drag and drop candidates across hiring stages.</p>
      </div>

      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-full pb-4">
            {Object.values(columns).map((col: any) => (
              <div key={col.id} className="w-80 flex-shrink-0 flex flex-col bg-muted/30 rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/50 flex justify-between items-center">
                  <h3 className="font-bold text-foreground">{col.title}</h3>
                  <Badge variant="secondary" className="bg-background text-muted-foreground">{col.candidateIds.length}</Badge>
                </div>
                
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-4 overflow-y-auto min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                    >
                      {col.candidateIds.map((candidateId: string, index: number) => {
                        const candidate = candidates[candidateId];
                        return (
                          <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`mb-4 cursor-grab active:cursor-grabbing border-border shadow-sm transition-shadow ${snapshot.isDragging ? 'shadow-md border-primary/50' : ''}`}
                              >
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-foreground">{candidate.name}</div>
                                    <button className="text-muted-foreground hover:text-foreground">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="text-xs text-muted-foreground mb-3">{candidate.college}</div>
                                  <div className="flex justify-between items-center">
                                    <Badge className={`text-[10px] py-0 px-2 ${
                                      candidate.band === 'Platinum' ? 'bg-gradient-to-r from-slate-300 to-slate-500 text-white' : 'bg-yellow-500 text-white'
                                    }`}>
                                      {candidate.band}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-yellow-500">
                                      <Star className="w-3 h-3 fill-current" />
                                      <span className="text-xs font-bold text-foreground">{candidate.score}</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
