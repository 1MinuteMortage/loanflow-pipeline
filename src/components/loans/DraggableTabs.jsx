import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";

export default function DraggableTabs({ tabs, activeTab, onSelect, onReorder }) {
  function handleDragEnd(result) {
    if (!result.destination || result.destination.index === result.source.index) return;
    onReorder(result.source.index, result.destination.index);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="loan-drawer-tabs" direction="horizontal">
        {(provided) => (
          <div
            className="flex border-b border-border px-6"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tabs.map((t, index) => (
              <Draggable key={t.key} draggableId={t.key} index={index}>
                {(prov) => (
                  <div
                    ref={prov.innerRef}
                    {...prov.draggableProps}
                    {...prov.dragHandleProps}
                    onClick={() => onSelect(t.key)}
                    title="Drag to reorder"
                    className={`flex items-center gap-1 px-1 py-3 mr-6 text-sm font-medium border-b-2 transition-colors cursor-grab active:cursor-grabbing select-none ${
                      activeTab === t.key
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <GripVertical className="w-3 h-3 text-muted-foreground/50" />
                    {t.label}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}