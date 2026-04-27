// src/components/profile/MentorCard.tsx
import {
  Expandable,
  ExpandableCard,
  ExpandableCardContent,
  ExpandableCardFooter,
  ExpandableCardHeader,
  ExpandableContent,
  ExpandableTrigger,
} from "../ui/expandable";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Users, Lock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { NumberTicker } from "../ui/number-ticker";
import type { MentorMentee } from "@/api/types/profile.types";

interface MentorCardProps {
  mentors: (MentorMentee & { segment: string })[];
  totalCount: number;
}

function MentorCard({ mentors, totalCount }: MentorCardProps) {
  const availableMentors = mentors.length;

  if (mentors.length === 0) {
    return (
      <Card className="p-4 mt-4 border border-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Mentors</span>
          </div>
          <Badge variant="secondary">0</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">No mentors yet</p>
      </Card>
    );
  }

  return (
    <Expandable
      className="w-full"
      expandDirection="both"
      expandBehavior="replace"
      initialDelay={0.2}
    >
      {() => (
        <ExpandableTrigger className="w-full bg-transparent">
          <ExpandableCard
            className="w-full bg-transparent p-0"
            collapsedSize={{ width: "100%", height: 60 }}
            expandedSize={{ width: "100%", height: 250 }}
            hoverToExpand={false}
            expandDelay={100}
            collapseDelay={400}
          >
            <ExpandableCardHeader>
              <div className="flex justify-between items-start w-full">
                <div className="flex items-start flex-col">
                  <Badge variant="secondary">
                    <NumberTicker value={availableMentors} /> Available
                  </Badge>
                  <h3 className="font-semibold text-xl">Mentors</h3>
                </div>
                <Button size="icon" variant="outline" className="h-8 w-8">
                  <Users className="h-4 w-4" />
                </Button>
              </div>
            </ExpandableCardHeader>

            <ExpandableCardContent className="h-[150px] custom-scrollbar overflow-y-auto pr-2">
              <ExpandableContent preset="blur-md" stagger staggerChildren={0.2}>
                <div className="mb-4 mt-2">
                  <div className="space-y-1">
                    {mentors.map((mentor) => (
                      <Card
                        className="py-0 bg-muted/50 hover:bg-muted/70 border-border/50 w-full cursor-pointer transition-colors shadow-none"
                        key={mentor.userId}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage
                                src={mentor.profilePicUrl || undefined}
                              />
                              <AvatarFallback>
                                {mentor.username?.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm line-clamp-1">
                                  {mentor.username}
                                </p>
                                <div className="flex items-center gap-1.5">
                                  <Badge
                                    variant="default"
                                    className="text-xs bg-green-600"
                                  >
                                    Active
                                  </Badge>
                                  <Lock className="h-3 w-3 text-muted-foreground" />
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed mt-1">
                                {mentor.bio}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2.5 px-0.5">
                                <Badge variant="secondary" className="text-[10px] font-bold py-0 px-2 h-5 bg-background shadow-sm border-border/10">
                                  {mentor.segment}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </ExpandableContent>
            </ExpandableCardContent>

            <ExpandableContent preset="slide-up">
              <ExpandableCardFooter className="py-2">
                <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                   <span>
                    <NumberTicker value={totalCount} /> Total Mentors
                  </span>
                </div>
              </ExpandableCardFooter>
            </ExpandableContent>
          </ExpandableCard>
        </ExpandableTrigger>
      )}
    </Expandable>
  );
}

export default MentorCard;
