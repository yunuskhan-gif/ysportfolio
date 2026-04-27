"use client";

// src/components/profile/MenteeCard.tsx
import { useRouter } from "next/navigation";
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
import { Users, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { NumberTicker } from "../ui/number-ticker";
import type { MentorMentee } from "@/api/types/profile.types";

interface MenteeCardProps {
  mentees: (MentorMentee & { segment: string })[];
  totalCount: number;
}

function MenteeCard({ mentees, totalCount }: MenteeCardProps) {
  const router = useRouter();
  const activeMentees = mentees?.length || 0;
  const hasNoMentees = !mentees || mentees.length === 0;

  const handleMenteeClick = (userId: string) => {
    router.push(`/mentee/${userId}/profile`);
  };

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
            collapsedSize={{ width: "100%", height: 50 }}
            expandedSize={{ width: "100%", height: hasNoMentees ? 150 : 250 }}
            hoverToExpand={false}
            expandDelay={100}
            collapseDelay={400}
          >
            <ExpandableCardHeader>
              <div className="flex justify-between items-start w-full">
                <div className="flex items-start flex-col">
                  <Badge variant="secondary">
                    <NumberTicker value={activeMentees} /> Active
                  </Badge>
                  <h3 className="font-semibold text-xl">Mentees</h3>
                </div>
                <Button size="icon" variant="outline" className="h-8 w-8">
                  <Users className="h-4 w-4" />
                </Button>
              </div>
            </ExpandableCardHeader>

            <ExpandableCardContent className="h-[150px] custom-scrollbar overflow-y-auto pr-2">
              <ExpandableContent preset="blur-md" stagger staggerChildren={0.2}>
                <div className="mb-4 mt-2">
                  {hasNoMentees ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                        <UserPlus className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        No mentees yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {mentees.map((mentee) => (
                        <Card
                           className="py-0 bg-muted/50 hover:bg-muted/70 border-border/50 w-full cursor-pointer transition-colors shadow-none"
                          key={mentee.userId}
                          onClick={() => handleMenteeClick(mentee.userId)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage
                                  src={mentee.profilePicUrl || undefined}
                                />
                                <AvatarFallback>
                                  {mentee.username?.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-sm line-clamp-1">
                                    {mentee.username}
                                  </p>
                                  <Badge
                                    variant="default"
                                    className="text-xs bg-green-600"
                                  >
                                    Active
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed mt-1">
                                  {mentee.bio}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2.5 px-0.5">
                                  <Badge variant="secondary" className="text-[10px] font-bold py-0 px-2 h-5 bg-background shadow-sm border-border/10">
                                    {mentee.segment}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </ExpandableContent>
            </ExpandableCardContent>

            <ExpandableContent preset="slide-up">
              <ExpandableCardFooter className="py-2">
                <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
                   <span>
                    <NumberTicker value={totalCount} /> Total Mentees
                  </span>
                  <span>View Profile →</span>
                </div>
              </ExpandableCardFooter>
            </ExpandableContent>
          </ExpandableCard>
        </ExpandableTrigger>
      )}
    </Expandable>
  );
}

export default MenteeCard;
