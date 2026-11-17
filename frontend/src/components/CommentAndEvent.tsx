import { FaArrowRight } from "react-icons/fa6";
import { useRef } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../common/axiosClient";
import Comment, { ICommentIn } from "./Comment";
import { t } from "i18next";
import { QueryClient } from "@tanstack/react-query";
import WebApp from "@twa-dev/sdk";
import { toast } from "react-toastify";
import BigCommentIcon from "../assets/icons/BigCommentIcon";
import EventCard from "./EventCard";
import { UserInterface } from "../data/hooks/users/interface";

export interface IEventCard {
  id: number;
  type: string;
  user: UserInterface;
  image: string;
  created_at: string;
  new_value: string;
  old_value: string;
}

interface IState {
  commentInput: boolean;
  commentText: string;
  selector: string;
  comments: ICommentIn[];
  events: IEventCard[];
}

const CommentAndEvent = (props: {
  state: IState;
  setState: React.Dispatch<React.SetStateAction<IState>>;
  queryClient: QueryClient;
}) => {
  const { state, setState, queryClient } = props;

  const { id } = useParams();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState({ ...state, commentText: e.target.value });
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const createComment = async () => {
    if (state.commentText.trim() === "") return;
    try {
      const response = await axiosClient.put(`/task/${id}/comment`, {
        text: state.commentText,
      });
      if (response) {
        queryClient.invalidateQueries({
          queryKey: ["taskData"],
        });
        setState({ ...state, commentText: "" });
        WebApp.expand();
        WebApp.MainButton.hide();
        WebApp.disableVerticalSwipes();
      }
    } catch (error) {
      console.log("create comment: " + error);
      toast.error(t("error_comment"), { position: "top-right", autoClose: 3000 });
    }
  };

  return (
    <>
      {state.selector === "comment" && (
        <>
          <div className='transition-all flex mt-5 items-center gap-2'>
            <textarea
              ref={textareaRef}
              onChange={handleChange}
              value={state.commentText}
              name=''
              id=''
              placeholder={t("enter_comment")}
              rows={1}
              style={{
                overflow: "hidden",
                resize: "none",
                width: "calc(100% - 30px)",
              }}
              onFocus={() => setState({ ...state, commentInput: true })}
              onMouseLeave={() => setState({ ...state, commentInput: false })}
              className='outline-none bg-gray-100 px-3 py-2 text-sm rounded-lg'
            />
            {state.commentText.trim() === "" ? (
              <div className='h-[30px] w-[30px] bg-gray-100 text-gray-500 flex justify-center items-center rounded-full'>
                <FaArrowRight />
              </div>
            ) : (
              <div
                onClick={createComment}
                className='h-[30px] w-[30px] bg-blue-500 text-white flex justify-center items-center rounded-full'
              >
                <FaArrowRight />
              </div>
            )}
          </div>
          <div className='transition-all flex flex-col gap-2 mt-5'>
            {state.comments.length > 0 ? (
              state.comments.map((comment: ICommentIn, index: number) => {
                return <Comment comment={comment} key={index} />;
              })
            ) : (
              <div className="w-full flex flex-col justify-center items-center">
                <BigCommentIcon />
                <p className="font-sfpro font-medium text-13 text-customBlack2">{t("no_comments")}</p>
              </div>
            )}
          </div>
        </>
      )}

      {state.selector === "event" && (
        <div className='transition-all flex flex-col gap-2 mt-5'>
          {state.events.length > 0 &&
            state.events.map((eventElement: IEventCard, index: number) => (
              <EventCard key={index} eventElement={eventElement} />
            ))}
        </div>
      )}
    </>
  );
};

export default CommentAndEvent;